export interface IMessage {
  text: string;
  senderId: number;
  chatId: number;
  createdAt?: Date;
  receiverId?: number; // Optional for private chats
}
