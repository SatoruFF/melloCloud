import { useCallback, useMemo, useState } from "react";
import { Column, Task } from "../../../entities/task/types/tasks";
import { gothicColors } from "../variables/gothicColors";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");

  const addTask = useCallback(() => {
    const trimmed = newTaskText.trim();
    if (!trimmed || !newTaskColumn) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: trimmed,
      columnId: newTaskColumn,
      createdAt: new Date(),
      priority: "medium",
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  }, [newTaskText, newTaskColumn]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addColumn = useCallback(() => {
    const trimmed = newColumnTitle.trim();
    if (!trimmed) return;

    const newColumn: Column = {
      id: Date.now().toString(),
      title: trimmed,
      color: gothicColors[columns.length % gothicColors.length],
      order: columns.length,
    };

    setColumns((prev) => [...prev, newColumn].sort((a, b) => a.order - b.order));
    setNewColumnTitle("");
    setShowAddColumn(false);

    // Set first column as default for new tasks
    if (columns.length === 0) {
      setNewTaskColumn(newColumn.id);
    }
  }, [columns, newColumnTitle]);

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (columns.length <= 1) return;
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
      setTasks((prev) => prev.filter((t) => t.columnId !== columnId));

      // Update newTaskColumn if deleted column was selected
      if (newTaskColumn === columnId) {
        const remainingColumns = columns.filter((c) => c.id !== columnId);
        setNewTaskColumn(remainingColumns[0]?.id || "");
      }
    },
    [columns, newTaskColumn]
  );

  const editColumn = useCallback((columnId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, title: trimmed } : c)));
    setEditingColumn(null);
    setEditColumnTitle("");
  }, []);

  const onDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      if (!draggedTaskId) return;

      setTasks((prev) => prev.map((t) => (t.id === draggedTaskId ? { ...t, columnId } : t)));
      setDraggedTaskId(null);
      setDragOverColumn(null);
    },
    [draggedTaskId]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDragEnter = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  }, []);

  return {
    tasks,
    columns,
    showAddColumn,
    newTaskText,
    newTaskColumn,
    draggedTaskId,
    dragOverColumn,
    newColumnTitle,
    editingColumn,
    editColumnTitle,
    setTasks,
    setColumns,
    setNewTaskText,
    setNewTaskColumn,
    setDraggedTaskId,
    setDragOverColumn,
    setShowAddColumn,
    setNewColumnTitle,
    setEditingColumn,
    setEditColumnTitle,
    addTask,
    deleteTask,
    deleteColumn,
    addColumn,
    onDrop,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,
    editColumn,
    getPriorityColor,
  };
};
