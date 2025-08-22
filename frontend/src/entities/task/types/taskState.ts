import { Task } from "./tasks";

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  draggedTask: Task | null;
  dragOverColumn: string | null;
}
