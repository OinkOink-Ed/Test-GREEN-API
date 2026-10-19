import type { Message, Notification } from '../types';

export function parseNotification(
  notification: Notification,
): Message | null {
  const { body } = notification;

  const isIncoming = body.typeWebhook === 'incomingMessageReceived';
  const isOutgoing =
    body.typeWebhook === 'outgoingAPIMessageReceived' ||
    body.typeWebhook === 'outgoingMessageReceived';

  if (!isIncoming && !isOutgoing) return null;

  if (body.messageData?.typeMessage !== 'textMessage') return null;
  const text = body.messageData.textMessageData?.textMessage;
  if (!text) return null;

  return {
    id: body.idMessage ?? String(notification.receiptId),
    text,
    isMine: isOutgoing,
    timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
  };
}