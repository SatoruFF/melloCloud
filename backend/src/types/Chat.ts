// Тип для получателя (receiver)
interface Receiver {
  id: number;
  userName: string;
  avatar: string | null;
}

// Тип для чата
interface Chat {
  id: number;
  title: string | null;
  isGroup: boolean;
  createdAt: Date | Record<string, unknown>;
  updatedAt: Date | Record<string, unknown>;
  isSelfChat: boolean;
  receiver: Receiver | null;
}

// Массив чатов
type Chats = Chat[];
