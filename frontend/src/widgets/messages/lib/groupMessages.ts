import type { Message } from "../../../entities/message";

const DEFAULT_GROUP_GAP_MS = 5 * 60 * 1000; // 5 минут

export interface MessageGroup {
  senderId: string;
  messages: Message[];
}

/**
 * Группирует подряд идущие сообщения от одного отправителя.
 * Новая группа начинается при смене отправителя или при разрыве по времени (по умолчанию 5 мин).
 */
export function groupMessages(
  messages: Message[],
  maxGapMs: number = DEFAULT_GROUP_GAP_MS
): MessageGroup[] {
  if (messages.length === 0) return [];

  const groups: MessageGroup[] = [];
  let current: MessageGroup = {
    senderId: String(messages[0].senderId),
    messages: [messages[0]],
  };

  const toTime = (m: Message) => {
    const raw = m.createdAt ?? m.time;
    if (typeof raw === "string" && raw !== m.time) return new Date(raw).getTime();
    if (typeof raw === "object" && raw instanceof Date) return raw.getTime();
    return Date.now();
  };

  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    const prevTime = toTime(messages[i - 1]);
    const currTime = toTime(msg);
    const sameSender = String(msg.senderId) === current.senderId;
    const withinGap = currTime - prevTime <= maxGapMs;

    if (sameSender && withinGap) {
      current.messages.push(msg);
    } else {
      groups.push(current);
      current = { senderId: String(msg.senderId), messages: [msg] };
    }
  }
  groups.push(current);
  return groups;
}
