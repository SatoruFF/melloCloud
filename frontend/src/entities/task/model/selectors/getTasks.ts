import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../app/store';

// Base selector
const getTasksState = (state: RootState) => state.tasks;

// Simple selectors
export const selectTasks = createSelector([getTasksState], tasksState => tasksState.tasks);

export const selectTasksLoading = createSelector([getTasksState], tasksState => tasksState.loading);

export const selectTasksError = createSelector([getTasksState], tasksState => tasksState.error);

export const selectDraggedTask = createSelector([getTasksState], tasksState => tasksState.draggedTask);

export const selectDragOverColumn = createSelector([getTasksState], tasksState => tasksState.dragOverColumn);

// Derived selectors
export const selectTasksByPriority = createSelector([selectTasks], tasks => {
  return tasks.reduce(
    (acc, task) => {
      const priority = task.priority || 'MEDIUM';
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(task);
      return acc;
    },
    {} as Record<string, typeof tasks>,
  );
});

export const selectCompletedTasks = createSelector([selectTasks], tasks => tasks.filter(task => task.isDone));

export const selectPendingTasks = createSelector([selectTasks], tasks => tasks.filter(task => !task.isDone));

export const selectOverdueTasks = createSelector([selectTasks], tasks => {
  const now = new Date();
  return tasks.filter(task => !task.isDone && task.dueDate && new Date(task.dueDate) < now);
});

export const selectTasksByColumn = (columnId: string | number) =>
  createSelector([selectTasks], tasks => tasks.filter(task => task.columnId?.toString() === columnId.toString()));

export const selectTaskById = (taskId: string | number) =>
  createSelector([selectTasks], tasks => tasks.find(task => task.id.toString() === taskId.toString()));
