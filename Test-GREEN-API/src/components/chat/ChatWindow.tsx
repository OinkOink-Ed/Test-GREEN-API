import { useRef, useEffect, useState } from 'react';
import type { Message } from '../../types';
import type { ChatItem } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';

interface Props {
  chat: ChatItem | undefined;
  messages: Message[];
  isSending: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onBack: () => void;
}

export function ChatWindow({
  chat,
  messages,
  isSending,
  error,
  onSend,
  onBack,
}: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const initials = chat?.name?.slice(0, 2).toUpperCase() || '??';

  return (
    <main className="flex-1 flex flex-col relative bg-[#f4f4f5] h-full">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-3 md:p-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Назад"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
            {chat?.avatar ? (
              <img
                src={chat.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <h2 className="text-md font-semibold text-gray-900">
              {chat?.name}
            </h2>
            <p className="text-xs text-gray-500">
              {chat?.type === 'group'
                ? 'Групповой чат'
                : chat?.phoneNumber
                  ? `+${chat.phoneNumber}`
                  : 'Личный чат'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex justify-center mt-10">
            <span className="bg-white/60 text-gray-500 text-sm px-4 py-1.5 rounded-full shadow-sm">
              Напишите первое сообщение...
            </span>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        <div ref={endRef} />
      </div>

      <footer className="bg-white border-t border-gray-200 p-3 md:p-4 shrink-0">
        {error && (
          <p className="text-red-500 text-sm mb-2 px-2">{error}</p>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 max-w-4xl mx-auto items-end"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-[#f4f4f5] border-none rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all"
            placeholder="Сообщение..."
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white p-3 rounded-full disabled:opacity-50 transition-colors shrink-0 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </footer>
    </main>
  );
}