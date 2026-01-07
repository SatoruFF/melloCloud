import React from "react";
import { CheckCircle, XCircle, Play, Edit2, Trash2 } from "lucide-react";
import type { WebhookProps } from "../types/webhook";
import styles from "./webhook.module.scss";

const Webhook: React.FC<WebhookProps> = ({ webhook, onEdit, onDelete, onTest }) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(webhook);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(webhook.id);
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest(webhook.id);
    }
  };

  const getStatusIcon = () => {
    switch (webhook.status) {
      case "ACTIVE":
        return <CheckCircle size={20} color="#52c41a" />;
      case "FAILED":
        return <XCircle size={20} color="#ff4d4f" />;
      case "PAUSED":
        return <XCircle size={20} color="#faad14" />;
      default:
        return <XCircle size={20} color="#d9d9d9" />;
    }
  };

  const getSuccessRate = () => {
    const total = webhook.successCount + webhook.failureCount;
    if (total === 0) return 0;
    return Math.round((webhook.successCount / total) * 100);
  };

  return (
    <div className={styles.webhookCard}>
      <div className={styles.webhookHeader}>
        <div className={styles.webhookInfo}>
          <h3 className={styles.webhookName}>{webhook.name}</h3>
          <p className={styles.webhookUrl}>{webhook.url}</p>
          {webhook.description && <p className={styles.webhookDescription}>{webhook.description}</p>}
        </div>
        <div className={styles.webhookStatus}>
          {getStatusIcon()}
          <span className={styles.statusText}>{webhook.status}</span>
        </div>
      </div>

      <div className={styles.webhookStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Успешно:</span>
          <strong className={styles.statValue}>{webhook.successCount}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Ошибок:</span>
          <strong className={styles.statValue}>{webhook.failureCount}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Успешность:</span>
          <strong className={styles.statValue}>{getSuccessRate()}%</strong>
        </div>
        {webhook.lastTriggeredAt && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Последний запуск:</span>
            <span className={styles.statValue}>{new Date(webhook.lastTriggeredAt).toLocaleString("ru-RU")}</span>
          </div>
        )}
      </div>

      <div className={styles.webhookEvents}>
        <span className={styles.eventsLabel}>События:</span>
        <div className={styles.eventsList}>
          {webhook.events.map((event) => (
            <span key={event} className={styles.eventBadge}>
              {event}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.webhookActions}>
        <button className={styles.actionButton} onClick={handleTest}>
          <Play size={16} />
          Тест
        </button>
        <button className={styles.actionButton} onClick={handleEdit}>
          <Edit2 size={16} />
          Изменить
        </button>
        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={handleDelete}>
          <Trash2 size={16} />
          Удалить
        </button>
      </div>
    </div>
  );
};

export default Webhook;
