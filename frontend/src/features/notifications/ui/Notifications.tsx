import { Drawer } from "antd";
import { Bell, CheckCircle, FileText, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import styles from "./notifications.module.scss";

export const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([
    { id: 1, icon: <MessageSquare />, text: t("notifications.newMessage"), time: "2 мин назад", unread: true },
    { id: 2, icon: <FileText />, text: t("notifications.fileUploaded"), time: "10 мин назад", unread: true },
    { id: 3, icon: <CheckCircle />, text: t("notifications.authSuccess"), time: "1 час назад", unread: false },
  ]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    handleClose();
  };

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
              <button onClick={clearAll} className={styles.clearBtn}>
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
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={64} className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t("notifications.empty")}</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {notifications.map(({ id, icon, text, time, unread }) => (
              <li key={id} className={cn(styles.listItem, { [styles.unread]: unread })} onClick={() => markAsRead(id)}>
                <div className={styles.itemIconWrapper}>{icon}</div>
                <div className={styles.itemContent}>
                  <span className={styles.itemText}>{text}</span>
                  <span className={styles.itemTime}>{time}</span>
                </div>
                {unread && <div className={styles.unreadDot} />}
                <button
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(id);
                  }}
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
