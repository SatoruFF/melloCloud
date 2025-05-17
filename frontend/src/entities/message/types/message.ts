export interface Message {
  id?: number;
  self: boolean;
  sender: string;
  text: string;
  time: string;
}

export interface MessageSchema {
  messages: Message[];
  currentChat: any;
  chatStack: number[] | [];
  view: string;
  paths: any[];
}
