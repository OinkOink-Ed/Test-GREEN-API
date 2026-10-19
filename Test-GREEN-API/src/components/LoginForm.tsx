import { useState } from 'react';
import type { Credentials } from '../types';
import { greenApi } from '../api/greenApi';

interface LoginFormProps {
  onLogin: (creds: Credentials) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) return;

    setIsLoading(true);
    setError(null);

    const creds = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };

    try {
      const state = await greenApi.getStateInstance(creds);
      if (state !== 'authorized') {
        setError(
          `Инстанс не авторизован (статус: ${state}). Проверьте настройки в личном кабинете GREEN-API.`,
        );
        return;
      }
      onLogin(creds);
    } catch {
      setError(
        'Неверный idInstance или apiTokenInstance. Проверьте данные.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Вход в GREEN-API
        </h1>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="idInstance"
          >
            idInstance
          </label>
          <input
            id="idInstance"
            type="text"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Введите idInstance"
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="apiToken"
          >
            apiTokenInstance
          </label>
          <input
            id="apiToken"
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Введите apiTokenInstance"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}