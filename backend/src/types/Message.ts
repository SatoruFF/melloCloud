export interface IMessage {
  text: string;
  senderId: number;
  chatId: number;
  createdAt?: Date;
}
