import React, { useState } from "react";
import { Button, Input, Select, Card, Tag, Dropdown, Space, Typography, Badge, Empty } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  DragOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import cn from "classnames";
import styles from "./kanban.module.scss";

const { Text, Title } = Typography;
const { Option } = Select;

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

const Kanban = () => {
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

  const gothicColors = [
    "#8B5CF6", // purple
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // emerald
    "#3B82F6", // blue
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
  ];

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
  };

  const deleteColumn = (columnId: string) => {
    if (columns.length <= 1) return;
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setTasks((prev) => prev.filter((t) => t.columnId !== columnId));

    // Update newTaskColumn if deleted column was selected
    if (newTaskColumn === columnId) {
      const remainingColumns = columns.filter((c) => c.id !== columnId);
      setNewTaskColumn(remainingColumns[0]?.id || "");
    }
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
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getColumnMenu = (column: Column) => ({
    items: [
      {
        key: "edit",
        label: "Edit Column",
        icon: <EditOutlined />,
        onClick: () => {
          setEditingColumn(column.id);
          setEditColumnTitle(column.title);
        },
      },
      ...(columns.length > 1
        ? [
            {
              key: "delete",
              label: "Delete Column",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => deleteColumn(column.id),
            },
          ]
        : []),
    ],
  });

  // Empty state when no columns
  if (columns.length === 0) {
    return (
      <div className={cn(styles.kanbanContainer)}>
        <div className={cn(styles.emptyState)}>
          <Empty
            image={<FileTextOutlined className={cn(styles.emptyIcon)} />}
            description={
              <div className={cn(styles.emptyDescription)}>
                <Title level={3} className={cn(styles.emptyTitle)}>
                  Welcome to Your Kanban Board
                </Title>
                <Text className={cn(styles.emptyText)}>Start by creating your first column to organize your tasks</Text>
              </div>
            }
          />
          <div className={cn(styles.addFirstColumn)}>
            {showAddColumn ? (
              <Card className={cn(styles.addColumnForm)}>
                <Input
                  placeholder="Enter column title (e.g., To Do, In Progress, Done)..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onPressEnter={addColumn}
                  autoFocus
                  size="large"
                  style={{ marginBottom: 16 }}
                />
                <Space>
                  <Button type="primary" onClick={addColumn} size="large">
                    Create Column
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnTitle("");
                    }}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>
              </Card>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddColumn(true)}
                size="large"
                className={cn(styles.createFirstColumnBtn)}
              >
                Create Your First Column
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.kanbanContainer)}>
      {/* Gothic Header */}
      <div className={cn(styles.kanbanHeader)}>
        <Card className={cn(styles.addTaskCard)}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="What needs to be done?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onPressEnter={addTask}
              size="large"
              style={{ flex: 1 }}
              className={cn(styles.taskInput)}
            />
            <Select
              value={newTaskColumn}
              onChange={setNewTaskColumn}
              size="large"
              style={{ minWidth: 160 }}
              placeholder="Choose column"
              className={cn(styles.columnSelect)}
            >
              {columns.map((col) => (
                <Option key={col.id} value={col.id}>
                  <Space>
                    <div className={cn(styles.colorDot)} style={{ backgroundColor: col.color }} />
                    {col.title}
                  </Space>
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addTask}
              size="large"
              className={cn(styles.addTaskBtn)}
              disabled={!newTaskColumn}
            >
              Add Task
            </Button>
          </Space.Compact>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className={cn(styles.kanbanBoard)}>
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <Card
              key={column.id}
              className={cn(styles.kanbanColumn, {
                [styles.dragOver]: dragOverColumn === column.id,
              })}
              onDrop={(e) => onDrop(e, column.id)}
              onDragOver={onDragOver}
              onDragEnter={() => onDragEnter(column.id)}
              bodyStyle={{ padding: 0 }}
            >
              {/* Column Header */}
              <div
                className={cn(styles.columnHeader)}
                style={{
                  borderTopColor: column.color,
                  background: `linear-gradient(135deg, ${column.color}15, ${column.color}05)`,
                }}
              >
                {editingColumn === column.id ? (
                  <Input
                    value={editColumnTitle}
                    onChange={(e) => setEditColumnTitle(e.target.value)}
                    onPressEnter={() => editColumn(column.id, editColumnTitle)}
                    onBlur={() => editColumn(column.id, editColumnTitle)}
                    autoFocus
                    size="large"
                    className={cn(styles.editInput)}
                  />
                ) : (
                  <div className={cn(styles.columnTitleContainer)}>
                    <Space>
                      <div className={cn(styles.columnColorIndicator)} style={{ backgroundColor: column.color }} />
                      <Title level={4} className={cn(styles.columnTitle)}>
                        {column.title}
                      </Title>
                      <Badge
                        count={tasks.filter((t) => t.columnId === column.id).length}
                        style={{
                          backgroundColor: column.color,
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </Space>
                    <Dropdown menu={getColumnMenu(column)} trigger={["click"]}>
                      <Button type="text" icon={<MoreOutlined />} className={cn(styles.columnMenuBtn)} />
                    </Dropdown>
                  </div>
                )}
              </div>

              {/* Tasks Container */}
              <div className={cn(styles.tasksContainer)}>
                {tasks
                  .filter((task) => task.columnId === column.id)
                  .map((task) => (
                    <Card
                      key={task.id}
                      size="small"
                      className={cn(styles.taskCard, {
                        [styles.dragging]: draggedTaskId === task.id,
                      })}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className={cn(styles.taskContent)}>
                        <div className={cn(styles.taskHeader)}>
                          <Text strong className={cn(styles.taskText)}>
                            {task.text}
                          </Text>
                          <div className={cn(styles.taskActions)}>
                            <DragOutlined className={cn(styles.dragHandle)} />
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={() => deleteTask(task.id)}
                              danger
                              size="small"
                              className={cn(styles.deleteBtn)}
                            />
                          </div>
                        </div>
                        <div className={cn(styles.taskMeta)}>
                          <Tag color={getPriorityColor(task.priority || "medium")} className={cn(styles.priorityTag)}>
                            {task.priority?.toUpperCase()}
                          </Tag>
                          <Text type="secondary" className={cn(styles.taskDate)}>
                            {new Date(task.createdAt).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}

                {/* Empty State */}
                {tasks.filter((t) => t.columnId === column.id).length === 0 && (
                  <div className={cn(styles.emptyColumn)}>
                    <div className={cn(styles.emptyColumnIcon)}>✨</div>
                    <Text type="secondary" className={cn(styles.emptyColumnText)}>
                      Drop tasks here
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          ))}

        {/* Add Column */}
        <div className={cn(styles.addColumnContainer)}>
          {showAddColumn ? (
            <Card className={cn(styles.addColumnForm)}>
              <Input
                placeholder="Enter column title..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onPressEnter={addColumn}
                autoFocus
                size="large"
                style={{ marginBottom: 16 }}
              />
              <Space>
                <Button type="primary" onClick={addColumn}>
                  Add Column
                </Button>
                <Button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnTitle("");
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Card>
          ) : (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              className={cn(styles.addColumnTrigger)}
              onClick={() => setShowAddColumn(true)}
              block
            >
              Add Column
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Kanban;
