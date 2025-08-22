// types/kanban.ts

// 🔹 Enums для статусов и приоритетов
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

// 🔹 Пользователь
export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

// 🔹 Колонка Kanban
export type TaskColumn = {
  id: number | string;
  title: string;
  color: string;
  order: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[]; // задачи в этой колонке
};

// 🔹 Задача
export type Task = {
  id: number | string;
  title: string;
  content: string;
  description?: string | null;
  category?: string | null;
  tag?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  isDone: boolean;
  dueDate?: Date | null;

  // Связи
  columnId?: number | string | null;
  column?: TaskColumn | null;

  userId?: number;
  user?: User;

  assignedToId?: number | null;
  assignedTo?: User | null;

  parentTaskId?: number | null;
  parentTask?: Task | null;
  subTasks?: Task[];

  createdAt?: Date;
  updatedAt?: Date;
};
