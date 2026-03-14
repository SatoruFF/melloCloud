import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { TaskColumn, Task } from "../../../entities/task/types/tasks";
import { gothicColors } from "../variables/gothicColors";
import { getUserSelector } from "../../../entities/user";
import { message } from "antd";
import { getErrorMessage } from "../../../types/api";

// Import API hooks and actions
import {
  useGetKanbanDataQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  setTasks,
  addTask as addTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  moveTask as moveTaskAction,
  setDraggedTask,
  setDragOverColumn,
  clearDragState,
  setLoading as setTaskLoading,
  setError as setTaskError,
} from "../../../entities/task";

import {
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  setColumns,
  addColumn as addColumnAction,
  updateColumn as updateColumnAction,
  deleteColumn as deleteColumnAction,
  setShowAddColumn,
  setEditingColumn,
  setLoading as setColumnLoading,
  setError as setColumnError,
} from "../../../entities/taskColumn";

// Утилитарные функции для преобразования дат
const serializeDates = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString() as any;
    }
  }
  return result;
};

const deserializeDates = <T extends Record<string, any>>(obj: T, dateFields: string[]): T => {
  const result = { ...obj };
  dateFields.forEach((field) => {
    if (result[field] && typeof result[field] === "string") {
      result[field] = new Date(result[field]) as any;
    }
  });
  return result;
};

interface UseTasksOptions {
  boardId: number | null;
}

export const useTasks = (options: UseTasksOptions) => {
  const { boardId } = options ?? { boardId: null };

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editColumnTitle, setEditColumnTitle] = useState("");

  const dispatch = useAppDispatch();

  // Get data from Redux store
  const {
    tasks,
    loading: taskLoading,
    error: taskError,
    draggedTask,
    dragOverColumn,
  } = useAppSelector((state) => state.tasks);

  const {
    columns,
    loading: columnLoading,
    error: columnError,
    showAddColumn,
    editingColumn,
  } = useAppSelector((state) => state.taskColumns);

  const {
    data: kanbanData,
    error: kanbanError,
    isLoading: kanbanLoading,
    refetch: refetchKanban,
  } = useGetKanbanDataQuery(boardId!, { skip: boardId == null });

  // Мутации
  const [createTaskMutation, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTaskMutation, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [deleteTaskMutation, { isLoading: isDeletingTask }] = useDeleteTaskMutation();
  const [moveTaskMutation, { isLoading: isMovingTask }] = useMoveTaskMutation();

  const [createColumnMutation, { isLoading: isCreatingColumn }] = useCreateColumnMutation();
  const [updateColumnMutation, { isLoading: isUpdatingColumn }] = useUpdateColumnMutation();
  const [deleteColumnMutation, { isLoading: isDeletingColumn }] = useDeleteColumnMutation();

  // Combined loading states
  const loading = useMemo(
    () =>
      kanbanLoading ||
      taskLoading ||
      columnLoading ||
      isCreatingTask ||
      isUpdatingTask ||
      isDeletingTask ||
      isMovingTask ||
      isCreatingColumn ||
      isUpdatingColumn ||
      isDeletingColumn,
    [
      kanbanLoading,
      taskLoading,
      columnLoading,
      isCreatingTask,
      isUpdatingTask,
      isDeletingTask,
      isMovingTask,
      isCreatingColumn,
      isUpdatingColumn,
      isDeletingColumn,
    ]
  );

  const error = kanbanError || taskError || columnError;

  // Load initial data and sync with Redux
  useEffect(() => {
    if (kanbanData) {
      try {
        // Transform backend data to frontend format с правильной сериализацией дат
        interface KanbanColumn {
          id: number;
          title: string;
          color: string;
          order: number;
          userId: number;
          createdAt: string;
          updatedAt: string;
          tasks?: KanbanTask[];
        }

        interface KanbanTask {
          id: number;
          title: string;
          content: string;
          description?: string;
          category?: string;
          tag?: string;
          priority: string;
          status: string;
          isDone: boolean;
          dueDate?: string | null;
          columnId?: number;
          userId: number;
          createdAt?: string;
          updatedAt?: string;
        }

        const transformedColumns: TaskColumn[] = kanbanData.map((col: KanbanColumn) =>
          serializeDates({
            id: col.id,
            title: col.title,
            color: col.color,
            order: col.order,
            userId: col.userId,
            createdAt: col.createdAt,
            updatedAt: col.updatedAt,
            tasks: col.tasks || [],
          })
        );

        const allTasks: Task[] = kanbanData.flatMap((col: KanbanColumn) =>
          (col.tasks || []).map((task: KanbanTask) =>
            serializeDates({
              id: task.id,
              title: task.title,
              content: task.content,
              description: task.description,
              category: task.category,
              tag: task.tag,
              priority: task.priority,
              status: task.status,
              isDone: task.isDone,
              dueDate: task.dueDate || null,
              columnId: task.columnId || col.id,
              userId: task.userId,
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: task.updatedAt || new Date().toISOString(),
            })
          )
        );

        dispatch(setColumns(transformedColumns));
        dispatch(setTasks(allTasks));

        // Set first column as default for new tasks
        if (transformedColumns.length > 0 && !newTaskColumn) {
          setNewTaskColumn(transformedColumns[0].id.toString());
        }
      } catch (err: unknown) {
        console.error("Error processing kanban data:", err);
        dispatch(setTaskError("Failed to process kanban data"));
      }
    }
  }, [kanbanData, dispatch, newTaskColumn]);

  // Task operations
  const addTask = useCallback(async () => {
    const trimmed = newTaskText.trim();
    if (!trimmed || !newTaskColumn) return;

    try {
      const newTask = await createTaskMutation({
        title: trimmed,
        content: trimmed,
        columnId: Number(newTaskColumn),
        priority: "MEDIUM",
      }).unwrap();

      // Сериализуем даты перед добавлением в состояние
      const serializedTask = serializeDates(newTask);
      dispatch(addTaskAction(serializedTask));
      setNewTaskText("");
      message.success("Task created successfully");
    } catch (err: unknown) {
      const apiError = err as Record<string, unknown>;
      const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
      const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to create task";
      dispatch(setTaskError(finalMsg));
      message.error(finalMsg);
    }
  }, [newTaskText, newTaskColumn, createTaskMutation, dispatch]);

  const deleteTask = useCallback(
    async (taskId: string | number) => {
      try {
        await deleteTaskMutation(taskId).unwrap();
        dispatch(deleteTaskAction(taskId));
        message.success("Task deleted successfully");
      } catch (err: unknown) {
        const apiError = err as Record<string, unknown>;
        const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
        const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to delete task";
        dispatch(setTaskError(finalMsg));
        message.error(finalMsg);
      }
    },
    [deleteTaskMutation, dispatch]
  );

  const updateTask = useCallback(
    async (taskId: string | number, updates: Partial<Task>) => {
      try {
        const updatedTask = await updateTaskMutation({
          taskId,
          ...updates,
          columnId: updates.columnId ? Number(updates.columnId) : undefined,
        }).unwrap();

        // Сериализуем даты
        const serializedTask = serializeDates(updatedTask);
        dispatch(updateTaskAction({ id: taskId, updates: serializedTask }));
        message.success("Task updated successfully");
      } catch (err: unknown) {
        const apiError = err as Record<string, unknown>;
        const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
        const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to update task";
        dispatch(setTaskError(finalMsg));
        message.error(finalMsg);
      }
    },
    [updateTaskMutation, dispatch]
  );

  // Column operations
  const addColumn = useCallback(async () => {
    const trimmed = newColumnTitle.trim();
    if (!trimmed || boardId == null) return;

    try {
      const newColumn = await createColumnMutation({
        title: trimmed,
        color: gothicColors[columns.length % gothicColors.length],
        boardId,
      }).unwrap();

      // Сериализуем даты
      const serializedColumn = serializeDates(newColumn);
      dispatch(addColumnAction(serializedColumn));
      setNewColumnTitle("");
      dispatch(setShowAddColumn(false));

      // Set as default for new tasks if it's the first column
      if (columns.length === 0) {
        setNewTaskColumn(newColumn.id.toString());
      }

      message.success("Column created successfully");
    } catch (err: unknown) {
      const apiError = err as Record<string, unknown>;
      const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
      const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to create column";
      dispatch(setColumnError(finalMsg));
      message.error(finalMsg);
    }
  }, [newColumnTitle, columns.length, createColumnMutation, dispatch, boardId]);

  const deleteColumn = useCallback(
    async (columnId: string | number) => {
      if (columns.length <= 1) {
        message.warning("Cannot delete the last column");
        return;
      }

      try {
        await deleteColumnMutation(columnId).unwrap();
        dispatch(deleteColumnAction(columnId));

        // Update newTaskColumn if deleted column was selected
        if (newTaskColumn === columnId.toString()) {
          const remainingColumns = columns.filter((c) => c.id.toString() !== columnId.toString());
          setNewTaskColumn(remainingColumns[0]?.id.toString() || "");
        }

        message.success("Column deleted successfully");
      } catch (err: unknown) {
        const apiError = err as Record<string, unknown>;
        const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
        const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to delete column";
        dispatch(setColumnError(finalMsg));
        message.error(finalMsg);
      }
    },
    [columns, newTaskColumn, deleteColumnMutation, dispatch]
  );

  const editColumn = useCallback(
    async (columnId: string | number, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      try {
        const updatedColumn = await updateColumnMutation({
          columnId,
          title: trimmed,
        }).unwrap();

        // Сериализуем даты
        const serializedColumn = serializeDates(updatedColumn);
        dispatch(updateColumnAction({ id: columnId, updates: serializedColumn }));
        dispatch(setEditingColumn(null));
        setEditColumnTitle("");
        message.success("Column updated successfully");
      } catch (err: unknown) {
        const apiError = err as Record<string, unknown>;
        const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
        const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to update column";
        dispatch(setColumnError(finalMsg));
        message.error(finalMsg);
      }
    },
    [updateColumnMutation, dispatch]
  );

  // Drag and drop operations
  const onDragStart = useCallback(
    (e: React.DragEvent, taskId: string | number) => {
      const task = tasks.find((t) => t.id.toString() === taskId.toString());
      if (task) {
        dispatch(setDraggedTask(task));
        e.dataTransfer.effectAllowed = "move";
      }
    },
    [tasks, dispatch]
  );

  const onDragEnd = useCallback(() => {
    dispatch(clearDragState());
  }, [dispatch]);

  const onDrop = useCallback(
    async (e: React.DragEvent, columnId: string | number) => {
      e.preventDefault();
      if (!draggedTask) return;

      // Don't move if already in the same column
      if (draggedTask.columnId?.toString() === columnId.toString()) {
        dispatch(clearDragState());
        return;
      }

      try {
        await moveTaskMutation({
          taskId: draggedTask.id,
          columnId: Number(columnId),
        }).unwrap();

        dispatch(
          moveTaskAction({
            taskId: draggedTask.id,
            columnId: columnId,
          })
        );

        dispatch(clearDragState());
        message.success("Task moved successfully");
      } catch (err: unknown) {
        const apiError = err as Record<string, unknown>;
        const errorMsg = apiError?.data && typeof apiError.data === 'object' ? (apiError.data as Record<string, unknown>).message : getErrorMessage(err);
        const finalMsg = typeof errorMsg === 'string' ? errorMsg : "Failed to move task";
        dispatch(setTaskError(finalMsg));
        message.error(finalMsg);
      }
    },
    [draggedTask, moveTaskMutation, dispatch]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDragEnter = useCallback(
    (columnId: string | number) => {
      dispatch(setDragOverColumn(columnId.toString()));
    },
    [dispatch]
  );

  // Utility function for priority colors
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "#EF4444";
      case "MEDIUM":
        return "#F59E0B";
      case "LOW":
        return "#10B981";
      default:
        return "#6B7280";
    }
  }, []);

  // Derived values
  const draggedTaskId = draggedTask?.id?.toString() || null;

  // Десериализуем даты для отображения
  const tasksWithDates = useMemo(
    () => tasks.map((task) => deserializeDates(task, ["createdAt", "updatedAt", "dueDate"])),
    [tasks]
  );

  const columnsWithDates = useMemo(
    () => columns.map((column) => deserializeDates(column, ["createdAt", "updatedAt"])),
    [columns]
  );

  return {
    // Data с десериализованными датами для отображения
    tasks: tasksWithDates,
    columns: columnsWithDates,
    loading,
    error,

    // UI State
    showAddColumn: showAddColumn || false,
    newTaskText,
    newTaskColumn,
    draggedTaskId,
    dragOverColumn,
    newColumnTitle,
    editingColumn,
    editColumnTitle,

    // UI State setters
    setNewTaskText,
    setNewTaskColumn,
    setNewColumnTitle,
    setEditColumnTitle,
    setShowAddColumn: (show: boolean) => dispatch(setShowAddColumn(show)),
    setEditingColumn: (id: string | null) => dispatch(setEditingColumn(id)),

    // Task operations
    addTask,
    deleteTask,
    updateTask,

    // Column operations
    addColumn,
    deleteColumn,
    editColumn,

    // Drag and drop
    onDrop,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,

    // Utilities
    getPriorityColor,
    refetchKanban: refetchKanban || (() => {}),
  };
};
