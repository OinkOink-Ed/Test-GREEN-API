import { useState } from 'react';

interface Props {
  onClose: () => void;
  onCreate: (phone: string) => Promise<void> | void;
  isChecking: boolean;
  error: string | null;
}

export function CreateChatModal({
  onClose,
  onCreate,
  isChecking,
  error,
}: Props) {
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPhone(digits.slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || isChecking) return;

    const finalPhone = `7${phone}`;
    onCreate(finalPhone);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Новый чат
        </h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-600 text-sm mb-2 font-medium">
            Номер телефона получателя (MAX)
          </label>

          <div className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-4 focus-within:ring-2 focus-within:ring-[#8b5cf6] focus-within:border-transparent transition-all">
            <span className="pl-4 pr-1 text-gray-800 font-medium select-none">
              +7
            </span>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="flex-1 bg-transparent py-3 px-2 text-gray-800 focus:outline-none"
              placeholder="9991234567"
              required
              autoFocus
              disabled={isChecking}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isChecking}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isChecking || phone.length < 10}
              className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Проверка...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}