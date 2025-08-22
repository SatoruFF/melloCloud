import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../../app/store/store";

// Basic column selectors
export const selectColumns = (state: RootState) => state.column.columns;
export const selectColumnsLoading = (state: RootState) => state.column.loading;
export const selectColumnsError = (state: RootState) => state.column.error;
export const selectShowAddColumn = (state: RootState) => state.column.showAddColumn;
export const selectEditingColumn = (state: RootState) => state.column.editingColumn;

// Computed column selectors
export const selectSortedColumns = createSelector([selectColumns], (columns) =>
  [...columns].sort((a, b) => (a.order || 0) - (b.order || 0))
);

export const selectColumnById = createSelector(
  [selectColumns, (_, columnId: string | number) => columnId],
  (columns, columnId) => columns.find((column) => column.id.toString() === columnId.toString())
);
