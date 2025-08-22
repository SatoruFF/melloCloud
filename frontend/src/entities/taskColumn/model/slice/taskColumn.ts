import { TaskColumn } from "../../types/tasksColumn";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ColumnInterface {
  columns: TaskColumn[];
  loading: boolean;
  error: string | null;
  showAddColumn: boolean;
  editingColumn: string | null;
}

const initialState: ColumnInterface = {
  columns: [],
  loading: false,
  error: null,
  showAddColumn: false,
  editingColumn: null,
};

export const columnSlice = createSlice({
  name: "column",
  initialState,
  reducers: {
    setColumns: (state, action: PayloadAction<TaskColumn[]>) => {
      state.columns = action.payload.sort((a, b) => a.order - b.order);
    },
    addColumn: (state, action: PayloadAction<TaskColumn>) => {
      state.columns.push(action.payload);
      state.columns.sort((a, b) => a.order - b.order);
    },
    updateColumn: (state, action: PayloadAction<{ id: string | number; updates: Partial<TaskColumn> }>) => {
      const { id, updates } = action.payload;
      const columnIndex = state.columns.findIndex((column) => column.id.toString() === id.toString());
      if (columnIndex !== -1) {
        state.columns[columnIndex] = { ...state.columns[columnIndex], ...updates };
        // Re-sort if order was updated
        if (updates.order !== undefined) {
          state.columns.sort((a, b) => a.order - b.order);
        }
      }
    },
    deleteColumn: (state, action: PayloadAction<string | number>) => {
      state.columns = state.columns.filter((column) => column.id.toString() !== action.payload.toString());
    },
    reorderColumns: (state, action: PayloadAction<Array<{ id: number; order: number }>>) => {
      const orderMap = new Map(action.payload.map((item) => [item.id, item.order]));

      state.columns = state.columns
        .map((column) => {
          const newOrder = orderMap.get(Number(column.id));
          return newOrder !== undefined ? { ...column, order: newOrder } : column;
        })
        .sort((a, b) => a.order - b.order);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setShowAddColumn: (state, action: PayloadAction<boolean>) => {
      state.showAddColumn = action.payload;
    },
    setEditingColumn: (state, action: PayloadAction<string | null>) => {
      state.editingColumn = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setColumns,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  setLoading,
  setError,
  setShowAddColumn,
  setEditingColumn,
  clearError,
} = columnSlice.actions;

export const { reducer: taskColumnReducer } = columnSlice;

export default columnSlice.reducer;
