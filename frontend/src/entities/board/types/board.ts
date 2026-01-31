export interface KanbanBoard {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
}

export interface KanbanBoardWithOwner extends KanbanBoard {
  user?: {
    id: number;
    userName: string | null;
    email: string;
    avatar: string | null;
  };
}
