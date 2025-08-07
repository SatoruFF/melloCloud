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
import { Column } from "../types/tasks";
import { useTasks } from "../hooks";
import { useTranslation } from "react-i18next";

const { Text, Title } = Typography;
const { Option } = Select;

const Kanban = () => {
  const {
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
    setNewTaskText,
    setNewTaskColumn,
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
  } = useTasks();

  const { t } = useTranslation();

  const getColumnMenu = (column: Column) => ({
    items: [
      {
        key: "edit",
        label: t("planner.kanban.columns.edit"),
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
              label: t("planner.kanban.columns.delete"),
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
                  {t("planner.kanban.welcome.title")}
                </Title>
                <Text className={cn(styles.emptyText)}>{t("planner.kanban.welcome.description")}</Text>
              </div>
            }
          />
          <div className={cn(styles.addFirstColumn)}>
            {showAddColumn ? (
              <Card className={cn(styles.addColumnForm)}>
                <Input
                  placeholder={t("planner.kanban.columns.enterTitlePlaceholder")}
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onPressEnter={addColumn}
                  autoFocus
                  size="large"
                  style={{ marginBottom: 16 }}
                />
                <Space>
                  <Button type="primary" onClick={addColumn} size="large">
                    {t("planner.kanban.columns.create")}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnTitle("");
                    }}
                    size="large"
                  >
                    {t("kanban.actions.cancel")}
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
                {t("planner.kanban.columns.createFirst")}
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
              placeholder={t("planner.kanban.tasks.placeholder")}
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
              placeholder={t("planner.kanban.columns.choose")}
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
              {t("planner.kanban.tasks.add")}
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
                            {t(`planner.kanban.tasks.priority.${task.priority?.toLowerCase() || "medium"}`)}
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
                      {t("planner.kanban.tasks.dropHere")}
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
                placeholder={t("planner.kanban.columns.enterTitle")}
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onPressEnter={addColumn}
                autoFocus
                size="large"
                style={{ marginBottom: 16 }}
              />
              <Space>
                <Button type="primary" onClick={addColumn}>
                  {t("planner.kanban.columns.add")}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnTitle("");
                  }}
                >
                  {t("planner.kanban.actions.cancel")}
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
              {t("planner.kanban.columns.add")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Kanban;
