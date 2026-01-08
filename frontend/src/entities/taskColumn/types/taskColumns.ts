export interface TaskColumnState {
  columns: TaskColumn[];
  loading: boolean;
  error: string | null;
  showAddColumn: boolean;
  editingColumn: string | null;
}

// Task priority and status enums
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

// User entity
export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

// Kanban column
export type TaskColumn = {
  id: number | string;
  title: string;
  color: string;
  order: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[]; // tasks in this column
};

// Task entity
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

  // Relations
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
