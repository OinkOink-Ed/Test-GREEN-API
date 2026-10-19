import type { Message } from '../../types';

export function ChatMessage({ msg }: { msg: Message }) {
  return (
    <div
      className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
          msg.isMine
            ? 'bg-[#8b5cf6] text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-relaxed">
          {msg.text}
        </p>
        <div
          className={`text-[11px] mt-1 text-right ${
            msg.isMine ? 'text-purple-200' : 'text-gray-400'
          }`}
        >
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {msg.isMine && <span className="ml-1">✓</span>}
        </div>
      </div>
    </div>
  );
}