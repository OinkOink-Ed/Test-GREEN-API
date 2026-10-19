import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import type { Credentials } from './types';
import { Chat } from './components/Chat';

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(() => {
    try {
      const savedId = localStorage.getItem('greenApiIdInstance');
      const savedToken = localStorage.getItem(
        'greenApiApiTokenInstance',
      );
      if (savedId && savedToken) {
        return {
          idInstance: savedId,
          apiTokenInstance: savedToken,
        };
      }
    } catch {
      // localStorage может быть недоступен (приватный режим)
    }
    return null;
  });

  const handleLogin = (newCreds: Credentials) => {
    try {
      localStorage.setItem(
        'greenApiIdInstance',
        newCreds.idInstance,
      );
      localStorage.setItem(
        'greenApiApiTokenInstance',
        newCreds.apiTokenInstance,
      );
    } catch {
      // ignore
    }
    setCreds(newCreds);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('greenApiIdInstance');
      localStorage.removeItem('greenApiApiTokenInstance');
    } catch {
      // ignore
    }
    setCreds(null);
  };

  if (!creds) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Chat creds={creds} onLogout={handleLogout} />;
}