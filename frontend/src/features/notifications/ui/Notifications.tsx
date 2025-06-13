import { Drawer } from "antd";
import { Bell, CheckCircle, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./notifications.module.scss";

export const Notifications = () => {
  const { t } = useTranslation();
  const [notificationCount, setNotificationCount] = useState(3);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const notifications = [
    { id: 1, icon: <MessageSquare className={styles.itemIcon} />, text: t("notifications.newMessage") },
    { id: 2, icon: <FileText className={styles.itemIcon} />, text: t("notifications.fileUploaded") },
    { id: 3, icon: <CheckCircle className={styles.itemIcon} />, text: t("notifications.authSuccess") },
  ];

  return (
    <>
      <div className={styles.notifications} onClick={handleOpen} aria-label={t("notifications.openDrawer")}>
        <div className={styles.iconWrapper}>
          <Bell className={styles.icon} />
          {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
        </div>
      </div>

      <Drawer
        title={t("notifications.title")}
        placement="bottom"
        height={320}
        onClose={handleClose}
        open={open}
        className={styles.drawer}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <ul className={styles.list}>
          {notifications.map(({ id, icon, text }) => (
            <li key={id} className={styles.listItem}>
              {icon}
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  );
};
