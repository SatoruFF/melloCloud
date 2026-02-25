// @ts-nocheck
import { Drawer, Input, Select, Button, Space, Typography, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../entities/task/types/tasks";
import type { TaskColumn } from "../../../entities/task/types/tasks";
import styles from "./taskCardModal.module.scss";

const { TextArea } = Input;
const { Option } = Select;

type TaskCardModalProps = {
  open: boolean;
  task: Task | null;
  columns: TaskColumn[];
  loading?: boolean;
  onClose: () => void;
  onSave: (taskId: string | number, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string | number) => Promise<void>;
  getPriorityColor: (priority: string) => string;
};

export const TaskCardModal = ({
  open,
  task,
  columns,
  loading,
  onClose,
  onSave,
  onDelete,
  getPriorityColor,
}: TaskCardModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [columnId, setColumnId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setContent(task.content || "");
      setDescription(task.description ?? "");
      setPriority(task.priority || "MEDIUM");
      setColumnId(task.columnId?.toString() ?? "");
      setDueDate(
        task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 10)
          : ""
      );
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await onSave(task.id, {
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        description: description.trim() || undefined,
        priority,
        columnId: columnId ? Number(columnId) : undefined,
        dueDate: dueDate || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <div className={styles.drawerTitle}>
          <span>{t("planner.kanban.card.editTask")}</span>
          <span className={styles.meta}>
            <span
              className={styles.priorityBadge}
              style={{ backgroundColor: getPriorityColor(priority) }}
            >
              {t(`planner.kanban.tasks.priority.${priority?.toLowerCase() || "medium"}`)}
            </span>
            {task.createdAt && (
              <Typography.Text type="secondary" className={styles.createdAt}>
                {t("planner.kanban.card.created")}{" "}
                {new Date(task.createdAt).toLocaleDateString()}
              </Typography.Text>
            )}
          </span>
        </div>
      }
      footer={
        <div className={styles.footer}>
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={handleDelete}
            loading={deleting}
            disabled={loading}
            className={styles.deleteBtn}
          >
            {t("planner.kanban.tasks.delete")}
          </Button>
          <Space>
            <Button onClick={onClose}>{t("planner.kanban.actions.cancel")}</Button>
            <Button type="primary" onClick={handleSave} loading={saving || loading}>
              {t("planner.kanban.card.save")}
            </Button>
          </Space>
        </div>
      }
      width={520}
      destroyOnClose
      className={styles.drawer}
    >
      <div className={styles.content}>
        <div className={styles.section}>
          <label className={styles.label}>{t("planner.kanban.card.title")}</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("planner.kanban.card.titlePlaceholder")}
            className={styles.titleInput}
          />
        </div>

      <div className={styles.section}>
        <label className={styles.label}>{t("planner.kanban.card.description")}</label>
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("planner.kanban.card.descriptionPlaceholder")}
          rows={4}
          className={styles.textArea}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>{t("planner.kanban.card.content")}</label>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("planner.kanban.card.contentPlaceholder")}
          rows={2}
          className={styles.textArea}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.section}>
          <label className={styles.label}>{t("planner.kanban.card.priority")}</label>
          <Select
            value={priority}
            onChange={setPriority}
            className={styles.select}
            options={[
              { value: "LOW", label: t("planner.kanban.tasks.priority.low") },
              { value: "MEDIUM", label: t("planner.kanban.tasks.priority.medium") },
              { value: "HIGH", label: t("planner.kanban.tasks.priority.high") },
            ]}
          />
        </div>
        <div className={styles.section}>
          <label className={styles.label}>{t("planner.kanban.card.dueDate")}</label>
          <DatePicker
            value={dueDate ? dayjs(dueDate) : null}
            onChange={(date: Dayjs | null) => setDueDate(date ? date.format("YYYY-MM-DD") : "")}
            className={styles.dateInput}
            allowClear
            format="DD.MM.YYYY"
          />
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>{t("planner.kanban.card.column")}</label>
        <Select
          value={columnId || undefined}
          onChange={setColumnId}
          placeholder={t("planner.kanban.columns.choose")}
          className={styles.selectFull}
        >
          {columns.map((col) => (
            <Option key={col.id} value={col.id.toString()}>
              <Space>
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: col.color }}
                />
                {col.title}
              </Space>
            </Option>
          ))}
        </Select>
      </div>
      </div>
    </Drawer>
  );
};
