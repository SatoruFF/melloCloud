import React, { useState, useEffect } from "react";
import cn from "classnames";
import { PlusOutlined, DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";

import styles from "./kanban.module.scss";

type Task = {
  id: string;
  text: string;
  columnId: string;
  createdAt: Date;
  priority?: "low" | "medium" | "high";
};

type Column = {
  id: string;
  title: string;
  color: string;
  order: number;
};

const defaultColumns: Column[] = [
  { id: "1", title: "To Do", color: "#FF6B6B", order: 0 },
  { id: "2", title: "In Progress", color: "#4ECDC4", order: 1 },
  { id: "3", title: "Review", color: "#45B7D1", order: 2 },
  { id: "4", title: "Done", color: "#96CEB4", order: 3 },
];

const UltraKanban = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState(columns[0]?.id || "");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471"];

  const addTask = () => {
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
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addColumn = () => {
    const trimmed = newColumnTitle.trim();
    if (!trimmed) return;

    const newColumn: Column = {
      id: Date.now().toString(),
      title: trimmed,
      color: colors[columns.length % colors.length],
      order: columns.length,
    };

    setColumns((prev) => [...prev, newColumn].sort((a, b) => a.order - b.order));
    setNewColumnTitle("");
    setShowAddColumn(false);
  };

  const deleteColumn = (columnId: string) => {
    if (columns.length <= 1) return;
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setTasks((prev) => prev.filter((t) => t.columnId !== columnId));
  };

  const editColumn = (columnId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, title: trimmed } : c)));
    setEditingColumn(null);
    setEditColumnTitle("");
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const onDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setTasks((prev) => prev.map((t) => (t.id === draggedTaskId ? { ...t, columnId } : t)));
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDragEnter = (columnId: string) => {
    setDragOverColumn(columnId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#FF4757";
      case "medium":
        return "#FFA502";
      case "low":
        return "#2ED573";
      default:
        return "#747D8C";
    }
  };

  return (
    <div className={cn(styles.kanbanContainer)}>
      <div className={cn(styles.kanbanHeader)}>
        {/* <h1 className={cn(styles.boardTitle)}>
          <span className={cn(styles.titleIcon)}>📋</span>
          Ultra Kanban Board
        </h1> */}

        <div className={cn(styles.addTaskSection)}>
          <div className={cn(styles.taskInputGroup)}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className={cn(styles.taskInput)}
            />
            <select
              value={newTaskColumn}
              onChange={(e) => setNewTaskColumn(e.target.value)}
              className={cn(styles.columnSelect)}
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
            <button onClick={addTask} className={cn(styles.addTaskBtn)}>
              <PlusOutlined />
            </button>
          </div>
        </div>
      </div>

      <div className={cn(styles.kanbanBoard)}>
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <div
              key={column.id}
              className={cn(styles.kanbanColumn, {
                [styles.dragOver]: dragOverColumn === column.id,
              })}
              onDrop={(e) => onDrop(e, column.id)}
              onDragOver={onDragOver}
              onDragEnter={() => onDragEnter(column.id)}
              style={{ "--column-color": column.color } as React.CSSProperties}
            >
              <div className={cn(styles.columnHeader)}>
                {editingColumn === column.id ? (
                  <div className={cn(styles.editColumnInput)}>
                    <input
                      type="text"
                      value={editColumnTitle}
                      onChange={(e) => setEditColumnTitle(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && editColumn(column.id, editColumnTitle)}
                      onBlur={() => editColumn(column.id, editColumnTitle)}
                      // autoFocus
                      className={cn(styles.columnTitleInput)}
                    />
                  </div>
                ) : (
                  <div className={cn(styles.columnTitleContainer)}>
                    <h3 className={cn(styles.columnTitle)}>{column.title}</h3>
                    <span className={cn(styles.taskCount)}>{tasks.filter((t) => t.columnId === column.id).length}</span>
                  </div>
                )}

                <div className={cn(styles.columnActions)}>
                  <button
                    className={cn(styles.columnActionBtn)}
                    onClick={() => {
                      setEditingColumn(column.id);
                      setEditColumnTitle(column.title);
                    }}
                  >
                    <EditOutlined />
                  </button>
                  {columns.length > 1 && (
                    <button
                      className={cn(styles.columnActionBtn, styles.delete)}
                      onClick={() => deleteColumn(column.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  )}
                </div>
              </div>

              <div className={cn(styles.tasksContainer)}>
                {tasks
                  .filter((task) => task.columnId === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className={cn(styles.taskCard, {
                        [styles.dragging]: draggedTaskId === task.id,
                      })}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className={cn(styles.taskContent)}>
                        <div className={cn(styles.taskText)}>{task.text}</div>
                        <div className={cn(styles.taskMeta)}>
                          <div
                            className={cn(styles.priorityIndicator)}
                            style={{ backgroundColor: getPriorityColor(task.priority || "medium") }}
                          />
                          <span className={cn(styles.taskDate)}>{new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={cn(styles.taskActions)}>
                        <button className={cn(styles.taskActionBtn)} onClick={() => deleteTask(task.id)}>
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {tasks.filter((t) => t.columnId === column.id).length === 0 && (
                <div className={cn(styles.emptyColumn)}>
                  <div className={cn(styles.emptyIcon)}>📝</div>
                  <p>No tasks yet</p>
                </div>
              )}
            </div>
          ))}

        <div className={cn(styles.addColumnContainer)}>
          {showAddColumn ? (
            <div className={cn(styles.addColumnForm)}>
              <input
                type="text"
                placeholder="Enter column title..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addColumn()}
                autoFocus
                className={cn(styles.columnTitleInput)}
              />
              <div className={cn(styles.addColumnActions)}>
                <button onClick={addColumn} className={cn(styles.addColumnBtn)}>
                  Add Column
                </button>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnTitle("");
                  }}
                  className={cn(styles.cancelBtn)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className={cn(styles.addColumnTrigger)} onClick={() => setShowAddColumn(true)}>
              <PlusOutlined />
              <span>Add another list</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UltraKanban;
