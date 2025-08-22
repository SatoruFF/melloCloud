import { Task } from "../../types/tasks";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TaskInterface {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  draggedTask: Task | null;
  dragOverColumn: string | null;
}

const initialState: TaskInterface = {
  tasks: [],
  loading: false,
  error: null,
  draggedTask: null,
  dragOverColumn: null,
};

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<{ id: string | number; updates: Partial<Task> }>) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id.toString() === id.toString());
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
    },
    deleteTask: (state, action: PayloadAction<string | number>) => {
      state.tasks = state.tasks.filter((task) => task.id.toString() !== action.payload.toString());
    },
    moveTask: (state, action: PayloadAction<{ taskId: string | number; columnId: string | number }>) => {
      const { taskId, columnId } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id.toString() === taskId.toString());
      if (taskIndex !== -1) {
        state.tasks[taskIndex].columnId = columnId;
      }
    },
    toggleTaskComplete: (state, action: PayloadAction<string | number>) => {
      const taskIndex = state.tasks.findIndex((task) => task.id.toString() === action.payload.toString());
      if (taskIndex !== -1) {
        state.tasks[taskIndex].isDone = !state.tasks[taskIndex].isDone;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDraggedTask: (state, action: PayloadAction<Task | null>) => {
      state.draggedTask = action.payload;
    },
    setDragOverColumn: (state, action: PayloadAction<string | null>) => {
      state.dragOverColumn = action.payload;
    },
    clearDragState: (state) => {
      state.draggedTask = null;
      state.dragOverColumn = null;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  toggleTaskComplete,
  setLoading,
  setError,
  setDraggedTask,
  setDragOverColumn,
  clearDragState,
} = taskSlice.actions;

export const { reducer: taskReducer } = taskSlice;

export default taskSlice.reducer;
