export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string | null;
  text: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
