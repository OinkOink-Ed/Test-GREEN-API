import type {
  CheckAccountResponse,
  ContactInfo,
  Credentials,
  HistoryMessage,
  Notification,
  SendMessageResponse,
} from '../types';

const API_URL = 'https://api.green-api.com/v3';

export const greenApi = {
  async getStateInstance(creds: Credentials): Promise<string> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/getStateInstance/${creds.apiTokenInstance}`,
    );
    if (!response.ok) throw new Error('Failed to get state');
    const data = await response.json();
    return data.stateInstance;
  },

  async checkAccount(
    creds: Credentials,
    phoneNumber: string,
  ): Promise<CheckAccountResponse> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/checkAccount/${creds.apiTokenInstance}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          force: true,
        }),
      },
    );
    if (!response.ok) return { exist: false };
    return response.json();
  },

  async sendMessage(
    creds: Credentials,
    chatId: string,
    message: string,
  ): Promise<SendMessageResponse> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/sendMessage/${creds.apiTokenInstance}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
      },
    );
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async receiveNotification(
    creds: Credentials,
    timeout: number = 60,
    signal?: AbortSignal,
  ): Promise<Notification | null> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=${timeout}`,
      { signal },
    );
    if (!response.ok) return null;
    const text = await response.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  },

  async deleteNotification(
    creds: Credentials,
    receiptId: number,
  ): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`,
      { method: 'DELETE' },
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.result === true;
  },

  async getChatHistory(
    creds: Credentials,
    chatId: string,
    count: number = 50,
  ): Promise<HistoryMessage[]> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/getChatHistory/${creds.apiTokenInstance}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, count }),
      },
    );
    if (!response.ok) return [];
    return response.json();
  },

  async getContactInfo(
    creds: Credentials,
    chatId: string,
  ): Promise<ContactInfo | null> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/getContactInfo/${creds.apiTokenInstance}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      },
    );
    if (!response.ok) return null;
    return response.json();
  },

  // Метод оставлен на будущее, но в логике чата больше не используется
  // (на бесплатном тарифе квота 100 вызовов/мес — упирались в QUOTE_EXCEEDED).
  async getAvatar(
    creds: Credentials,
    chatId: string,
  ): Promise<string | null> {
    const response = await fetch(
      `${API_URL}/waInstance${creds.idInstance}/getAvatar/${creds.apiTokenInstance}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.urlAvatar || null;
  },
};