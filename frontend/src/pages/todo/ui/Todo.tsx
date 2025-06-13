import React, { useState } from "react";
import { Button, Input, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./todo.module.scss";

type Task = {
  id: string;
  text: string;
  status: "todo" | "inprogress" | "done";
};

const Kanban = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const addTask = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    setTasks([...tasks, { id: Date.now().toString(), text: trimmed, status: "todo" }]);
    setNewTaskText("");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    setTasks(tasks.map((t) => (t.id === draggedTaskId ? { ...t, status } : t)));
    setDraggedTaskId(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const statuses: { key: Task["status"]; label: string }[] = [
    { key: "todo", label: "To Do" },
    { key: "inprogress", label: "In Progress" },
    { key: "done", label: "Done" },
  ];

  return (
    <div className={styles.kanbanWrapper}>
      <div className={styles.inputRow}>
        <Input
          placeholder="New task"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onPressEnter={addTask}
          allowClear
          size="large"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={addTask} size="large" />
      </div>

      <div className={styles.board}>
        {statuses.map(({ key, label }) => (
          <div key={key} className={styles.column} onDrop={(e) => onDrop(e, key)} onDragOver={onDragOver}>
            <h2 className={styles.columnTitle}>{label}</h2>
            {tasks
              .filter((task) => task.status === key)
              .map((task) => (
                <Card
                  key={task.id}
                  className={styles.taskCard}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  actions={[<DeleteOutlined key="delete" onClick={() => deleteTask(task.id)} />]}
                >
                  {task.text}
                </Card>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;
