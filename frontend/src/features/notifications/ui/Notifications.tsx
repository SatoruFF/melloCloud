import { NotificationOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { useState } from 'react'; // Добавляем useState для счетчика
import styles from './notifications.module.scss';

export const Notifications = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  return (
    <div className={styles.notifications}>
      <div className={styles.iconWrapper}>
        <NotificationOutlined className={styles.icon} />
        {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
      </div>
    </div>
  );
};
