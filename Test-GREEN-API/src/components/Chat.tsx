import { useState } from 'react';
import type { Credentials } from '../types';
import { useChat } from '../hooks/useChat';
import { ChatWindow } from './chat/ChatWindow';
import { CreateChatModal } from './chat/CreateChatModal';
import { ChatSidebar } from './chat/ChatSideBar';

interface ChatProps {
  creds: Credentials;
  onLogout: () => void;
}

export function Chat({ creds, onLogout }: ChatProps) {
  const {
    chats,
    activeChatId,
    activeMessages,
    isSending,
    error,
    createChatError,
    isCheckingNumber,
    openChat,
    createChat,
    sendMessage,
    setActiveChatId,
  } = useChat(creds);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Оборачиваем createChat: если успешно — закрываем модалку.
  const handleCreateChat = async (phone: string) => {
    const ok = await createChat(phone);
    if (ok) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f4f5] overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onOpenChat={openChat}
        onCreateClick={() => setIsModalOpen(true)}
        onLogout={onLogout}
      />

      {activeChatId ? (
        <ChatWindow
          chat={activeChat}
          messages={activeMessages}
          isSending={isSending}
          error={error}
          onSend={sendMessage}
          onBack={() => setActiveChatId(null)}
        />
      ) : (
        <main className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mb-4 opacity-50"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-500">
            Выберите чат
          </p>
          <p className="text-sm mt-1">
            или создайте новый, нажав на «+»
          </p>
        </main>
      )}

      {isModalOpen && (
        <CreateChatModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateChat}
          isChecking={isCheckingNumber}
          error={createChatError}
        />
      )}
    </div>
  );
}