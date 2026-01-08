import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../app/store/store';

// Base selector
const getTaskColumnsState = (state: RootState) => state.taskColumns;

// Simple selectors
export const selectColumns = createSelector([getTaskColumnsState], taskColumnsState => taskColumnsState.columns);

export const selectColumnsLoading = createSelector([getTaskColumnsState], taskColumnsState => taskColumnsState.loading);

export const selectColumnsError = createSelector([getTaskColumnsState], taskColumnsState => taskColumnsState.error);

export const selectShowAddColumn = createSelector(
  [getTaskColumnsState],
  taskColumnsState => taskColumnsState.showAddColumn,
);

export const selectEditingColumn = createSelector(
  [getTaskColumnsState],
  taskColumnsState => taskColumnsState.editingColumn,
);

// Derived selectors
export const selectSortedColumns = createSelector([selectColumns], columns =>
  [...columns].sort((a, b) => (a.order || 0) - (b.order || 0)),
);

export const selectColumnById = (columnId: string | number) =>
  createSelector([selectColumns], columns => columns.find(column => column.id.toString() === columnId.toString()));
