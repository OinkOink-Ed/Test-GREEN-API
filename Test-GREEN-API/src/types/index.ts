export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface Message {
  id: string;
  text: string;
  isMine: boolean;
  timestamp: number;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface ContactInfo {
  contactName: string;
  phoneNumber: number;
  name: string;
  avatar: string;
}

export interface HistoryMessage {
  idMessage: string;
  type: string; // 'incoming' | 'outgoing'
  typeMessage: string;
  textMessage?: string;
  timestamp: number;
  chatId: string;
  senderId: string;
}

export interface NotificationBody {
  typeWebhook: string;
  idMessage?: string;
  timestamp?: number;
  senderData?: {
    chatId: string;
    sender: string;
    senderName?: string;
    senderContactName?: string;
    senderPhoneNumber?: number;
    chatType?: string
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
  };
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId?: string;
}