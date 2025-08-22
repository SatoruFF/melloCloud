import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../../app/store/store";
import { selectTasks } from "./taskSelectors";
import { selectColumns } from "./columnSelectors";

// Combined selectors that use both tasks and columns
export const selectTasksByColumn = createSelector([selectTasks, selectColumns], (tasks, columns) => {
  const tasksByColumn = new Map();
  columns.forEach((column) => {
    const columnTasks = tasks.filter((task) => task.columnId?.toString() === column.id.toString());
    tasksByColumn.set(column.id.toString(), columnTasks);
  });
  return tasksByColumn;
});

export const selectTaskStats = createSelector([selectTasks, selectColumns], (tasks, columns) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isDone).length;
  const pending = total - completed;
  const overdue = tasks.filter((t) => !t.isDone && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const byPriority = tasks.reduce(
    (acc, task) => {
      const priority = task.priority || "MEDIUM";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const byColumn = columns.reduce(
    (acc, column) => {
      const columnTasks = tasks.filter((t) => t.columnId?.toString() === column.id.toString()).length;
      acc[column.id.toString()] = columnTasks;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total,
    completed,
    pending,
    overdue,
    byPriority,
    byColumn,
  };
});

export const selectColumnStats = createSelector([selectColumns, selectTasks], (columns, tasks) => {
  return columns.map((column) => {
    const columnTasks = tasks.filter((task) => task.columnId?.toString() === column.id.toString());

    return {
      id: column.id,
      title: column.title,
      color: column.color,
      order: column.order,
      totalTasks: columnTasks.length,
      completedTasks: columnTasks.filter((t) => t.isDone).length,
      pendingTasks: columnTasks.filter((t) => !t.isDone).length,
      priorityBreakdown: {
        high: columnTasks.filter((t) => t.priority === "HIGH").length,
        medium: columnTasks.filter((t) => t.priority === "MEDIUM").length,
        low: columnTasks.filter((t) => t.priority === "LOW").length,
      },
    };
  });
});
