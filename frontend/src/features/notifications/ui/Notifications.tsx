import { Drawer } from "antd";
import { Bell } from "lucide-react";
import { useState } from "react";
import styles from "./notifications.module.scss";

export const Notifications = () => {
  const [notificationCount, setNotificationCount] = useState(3); // пока фиксировано
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <div className={styles.notifications} onClick={handleOpen}>
        <div className={styles.iconWrapper}>
          <Bell className={styles.icon} />
          {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
        </div>
      </div>

      <Drawer
        title="Уведомления"
        placement="bottom"
        height={300}
        onClose={handleClose}
        open={open}
        style={{ backgroundColor: "white" }}
      >
        <ul className={styles.list}>
          <li>🔔 Вы получили новое сообщение</li>
          <li>📁 Файл успешно загружен</li>
          <li>✅ Авторизация прошла успешно</li>
        </ul>
      </Drawer>
    </>
  );
};
