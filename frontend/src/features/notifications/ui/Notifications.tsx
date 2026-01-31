import { Drawer } from "antd";
import { Bell, CheckCircle, FileText, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import cn from "classnames";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useRemoveNotificationMutation,
  useClearAllNotificationsMutation,
} from "../../../entities/notification";
import type { Notification as NotificationType } from "../../../entities/notification";
import styles from "./notifications.module.scss";

function getIconByType(type: string) {
  switch (type) {
    case "MESSAGE":
      return <MessageSquare />;
    case "FILE_UPLOAD":
      return <FileText />;
    case "TASK_ASSIGNED":
    case "AUTH_SUCCESS":
      return <CheckCircle />;
    default:
      return <Bell />;
  }
}

export const Notifications = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading: listLoading } = useGetNotificationsQuery(undefined, {
    skip: !open,
  });
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

  const [markAsRead] = useMarkAsReadMutation();
  const [removeNotification] = useRemoveNotificationMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleMarkAsRead = (n: NotificationType) => {
    if (!n.read) markAsRead(n.id);
  };

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const handleClearAll = () => {
    clearAll();
    handleClose();
  };

  const formatTime = (dateStr: string) =>
    DateTime.fromISO(dateStr).setLocale(i18n.language || "en").toRelative() ?? dateStr;

  return (
    <>
      <div className={styles.notifications} onClick={handleOpen} aria-label={t("notifications.openDrawer")}>
        <div className={styles.iconWrapper}>
          <Bell className={styles.icon} size={24} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
        </div>
      </div>

      <Drawer
        title={
          <div className={styles.drawerHeader}>
            <span>{t("notifications.title")}</span>
            {notifications.length > 0 && (
              <button onClick={handleClearAll} className={styles.clearBtn}>
                {t("notifications.clearAll")}
              </button>
            )}
          </div>
        }
        placement="right"
        width={420}
        onClose={handleClose}
        open={open}
        className={styles.drawer}
        closeIcon={<X size={20} />}
      >
        {listLoading ? (
          <div className={styles.empty}>
            <span>{t("common.loading") || "Loading..."}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={64} className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t("notifications.empty")}</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(styles.listItem, { [styles.unread]: !n.read })}
                onClick={() => handleMarkAsRead(n)}
              >
                <div className={styles.itemIconWrapper}>{getIconByType(n.type)}</div>
                <div className={styles.itemContent}>
                  <span className={styles.itemText}>
                    {t(`notifications.types.${n.type}`) || n.title || n.text}
                  </span>
                  {n.text !== (n.title ?? n.text) && (
                    <span className={styles.itemSubtext}>{n.text}</span>
                  )}
                  <span className={styles.itemTime}>{formatTime(n.createdAt)}</span>
                </div>
                {!n.read && <div className={styles.unreadDot} />}
                <button
                  className={styles.removeBtn}
                  onClick={(e) => handleRemove(e, n.id)}
                  aria-label="Remove notification"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  );
};
