import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../../app/store/store";

// Basic task selectors
export const selectTasks = (state: RootState) => state.task.tasks;
export const selectTasksLoading = (state: RootState) => state.task.loading;
export const selectTasksError = (state: RootState) => state.task.error;
export const selectDraggedTask = (state: RootState) => state.task.draggedTask;
export const selectDragOverColumn = (state: RootState) => state.task.dragOverColumn;

// Computed task selectors
export const selectTasksByPriority = createSelector([selectTasks], (tasks) => {
  return tasks.reduce(
    (acc, task) => {
      const priority = task.priority || "MEDIUM";
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(task);
      return acc;
    },
    {} as Record<string, typeof tasks>
  );
});

export const selectCompletedTasks = createSelector([selectTasks], (tasks) => tasks.filter((task) => task.isDone));

export const selectPendingTasks = createSelector([selectTasks], (tasks) => tasks.filter((task) => !task.isDone));

export const selectOverdueTasks = createSelector([selectTasks], (tasks) => {
  const now = new Date();
  return tasks.filter((task) => !task.isDone && task.dueDate && new Date(task.dueDate) < now);
});

export const selectTasksByColumn = createSelector(
  [selectTasks, (_, columnId: string | number) => columnId],
  (tasks, columnId) => {
    return tasks.filter((task) => task.columnId?.toString() === columnId.toString());
  }
);
