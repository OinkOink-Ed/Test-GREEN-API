import { useState, useMemo } from 'react';
import type { ChatItem } from '../../hooks/useChat';

interface Props {
  chats: ChatItem[];
  activeChatId: string | null;
  onOpenChat: (id: string) => void;
  onCreateClick: () => void;
  onLogout: () => void;
}

export function ChatSidebar({ chats, activeChatId, onOpenChat, onCreateClick, onLogout }: Props) {
  const [search, setSearch] = useState('');
  
  // Фильтрация и сортировка
  const filteredAndSorted = useMemo(() => {
    // 1. Фильтруем по поиску
    const filtered = chats.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.phoneNumber && c.phoneNumber.includes(search))
    );

    // 2. Сортируем по времени последнего сообщения (свежие сверху).
    // Если времени нет, такие чаты уходят вниз.
    return [...filtered].sort((a, b) => {
      const timeA = a.lastMessageTime || 0;
      const timeB = b.lastMessageTime || 0;
      return timeB - timeA;
    });
  }, [chats, search]);

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const today = new Date();
    
    // Если сообщение сегодня — показываем время, иначе — дату
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  return (
    <aside className={`w-full md:w-80 bg-white border-r border-gray-200 flex-col shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">MAX</h1>
        <button onClick={onCreateClick} className="bg-[#8b5cf6] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#7c3aed] transition-colors">
          +
        </button>
      </div>
      
      {/* Поиск */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <input
            type="text" 
            placeholder="Поиск" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f4f4f5] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSorted.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => onOpenChat(chat.id)} 
            className={`p-3 cursor-pointer border-l-4 transition-colors ${
              activeChatId === chat.id 
                ? 'bg-[#f3f0ff] border-[#8b5cf6]' 
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Аватар + бейдж */}
              <div className="relative shrink-0">
                {chat.avatar ? (
                  <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">
                    {chat.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {chat.unreadCount && chat.unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </span>
                ) : null}
              </div>

              {/* Текст и время */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold text-gray-900 truncate">{chat.name}</p>
                  {chat.lastMessageTime && (
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {chat.lastMessageSenderName ? `${chat.lastMessageSenderName}: ` : ''}
                  {chat.lastMessageText || (chat.phoneNumber ? `+${chat.phoneNumber}` : 'Нет сообщений')}
                </p>
              </div>
            </div>
          </div>
        ))}
        {filteredAndSorted.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm mt-10">
            {search ? 'Ничего не найдено' : 'Нет активных чатов.\nНажмите «+», чтобы начать.'}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100">
         <button onClick={onLogout} className="w-full text-left text-sm text-gray-500 hover:text-red-500 transition-colors">
           Выйти из аккаунта
         </button>
      </div>
    </aside>
  );
}