import { TaskColumn } from "./tasksColumn";

export interface TaskColumnState {
  columns: TaskColumn[];
  loading: boolean;
  error: string | null;
  showAddColumn: boolean;
  editingColumn: string | null;
}
