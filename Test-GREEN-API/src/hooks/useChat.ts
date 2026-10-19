import { useState, useEffect, useCallback, useRef } from 'react';
import type { Credentials, Message } from '../types';
import { greenApi } from '../api/greenApi';
import { parseNotification } from '../utils/parseNotification';

export interface ChatItem {
  id: string;
  name: string;
  phoneNumber?: string;
  unreadCount?: number;
  avatar?: string;
  type?: string;
  lastMessageText?: string;
  lastMessageTime?: number;
  lastMessageSenderName?: string;
}

const EMPTY_MESSAGES: Message[] = [];

export function useChat(creds: Credentials) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createChatError, setCreateChatError] = useState<string | null>(null);
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);

  const activeChatIdRef = useRef<string | null>(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const chatsRef = useRef<ChatItem[]>(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // === POLLING ===
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const poll = async () => {
      while (isActive) {
        try {
          const notification = await greenApi.receiveNotification(
            creds,
            60,
            controller.signal,
          );
          if (!isActive) break;

          if (notification) {
            const msg = parseNotification(notification);
            const notifChatId = notification.body.senderData?.chatId;

            if (msg && notifChatId) {
              const existingChat = chatsRef.current.find(
                (c) => c.id === notifChatId,
              );

              if (existingChat) {
                const isActiveChat = activeChatIdRef.current === notifChatId;
                const senderName =
                  notification.body.senderData?.senderContactName ||
                  notification.body.senderData?.senderName;

                setMessages((prevMsgs) => {
                  const chatMsgs = prevMsgs[notifChatId] || [];
                  if (chatMsgs.some((m) => m.id === msg.id)) return prevMsgs;
                  return {
                    ...prevMsgs,
                    [notifChatId]: [...chatMsgs, msg],
                  };
                });

                setChats((prevChats) =>
                  prevChats.map((c) =>
                    c.id === notifChatId
                      ? {
                          ...c,
                          lastMessageText: msg.text,
                          lastMessageTime: msg.timestamp,
                          lastMessageSenderName: msg.isMine
                            ? undefined
                            : c.type === 'group'
                              ? senderName
                              : undefined,
                          unreadCount:
                            !msg.isMine && !isActiveChat
                              ? (c.unreadCount || 0) + 1
                              : c.unreadCount,
                        }
                      : c,
                  ),
                );
              }
            }

            await greenApi.deleteNotification(
              creds,
              notification.receiptId,
            );
          }
        } catch (err) {
          if (!isActive) break;
          console.error('Polling error', err);
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    };

    poll();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [creds.idInstance, creds.apiTokenInstance, creds]);

  // === ИСТОРИЯ ===
  const loadHistory = useCallback(
    async (chatId: string) => {
      try {
        const history = await greenApi.getChatHistory(creds, chatId, 50);
        const formatted: Message[] = history
          .filter((m) => m.typeMessage === 'textMessage')
          .map((m) => ({
            id: m.idMessage,
            text: m.textMessage || '',
            isMine: m.type === 'outgoing',
            timestamp: m.timestamp * 1000,
          }))
          .reverse();

        setMessages((prev) => {
          const existing = prev[chatId] || [];
          const existingIds = new Set(existing.map((m) => m.id));
          const newMsgs = formatted.filter((m) => !existingIds.has(m.id));
          const combined = [...newMsgs, ...existing].sort(
            (a, b) => a.timestamp - b.timestamp,
          );
          return { ...prev, [chatId]: combined };
        });
      } catch (err) {
        console.error('Failed to load history', err);
      }
    },
    [creds],
  );

  // === ОТКРЫТИЕ ЧАТА ===
  const openChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      loadHistory(chatId);

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    },
    [loadHistory],
  );

  // === СОЗДАНИЕ ЧАТА (с проверкой) ===
  // Возвращает true, если чат создан/открыт успешно; false — если ошибка.
  const createChat = useCallback(
    async (phone: string): Promise<boolean> => {
      setIsCheckingNumber(true);
      setCreateChatError(null);
      setError(null);

      try {
        let normalizedPhone = phone.replace(/\D/g, '');

        if (
          normalizedPhone.startsWith('8') &&
          normalizedPhone.length === 11
        ) {
          normalizedPhone = '7' + normalizedPhone.slice(1);
        }

        const check = await greenApi.checkAccount(
          creds,
          normalizedPhone,
        );

        if (!check.exist) {
          setCreateChatError(
            'Аккаунт с таким номером не найден в MAX.',
          );
          return false;
        }

        const newChatId = check.chatId || `${normalizedPhone}@c.us`;

        const alreadyExists = chatsRef.current.some(
          (c) => c.id === newChatId,
        );
        if (alreadyExists) {
          setActiveChatId(newChatId);
          loadHistory(newChatId);
          return true;
        }

        const info = await greenApi.getContactInfo(creds, newChatId);

        const displayPhone = `+${normalizedPhone}`;
        const newChat: ChatItem = {
          id: newChatId,
          name: info?.contactName || info?.name || displayPhone,
          phoneNumber: normalizedPhone,
          type: 'user',
        };

        setChats((prev) => [...prev, newChat]);
        setActiveChatId(newChatId);
        loadHistory(newChatId);
        return true;
      } catch (e) {
        console.error('Failed to create chat', e);
        setCreateChatError(
          'Ошибка при создании чата. Проверьте номер.',
        );
        return false;
      } finally {
        setIsCheckingNumber(false);
      }
    },
    [creds, loadHistory],
  );

  // === ОТПРАВКА ===
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeChatId) return;
      setIsSending(true);
      setError(null);
      try {
        const res = await greenApi.sendMessage(
          creds,
          activeChatId,
          text,
        );
        const myMsg: Message = {
          id: res.idMessage,
          text,
          isMine: true,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const chatMsgs = prev[activeChatId] || [];
          if (chatMsgs.some((m) => m.id === myMsg.id)) return prev;
          return {
            ...prev,
            [activeChatId]: [...chatMsgs, myMsg],
          };
        });
      } catch {
        setError('Не удалось отправить сообщение.');
      } finally {
        setIsSending(false);
      }
    },
    [creds, activeChatId],
  );

  const activeMessages = activeChatId
    ? messages[activeChatId] ?? EMPTY_MESSAGES
    : EMPTY_MESSAGES;

  return {
    chats,
    activeChatId,
    messages,
    activeMessages,
    isSending,
    error,
    createChatError,
    isCheckingNumber,
    openChat,
    createChat,
    sendMessage,
    setActiveChatId,
  };
}