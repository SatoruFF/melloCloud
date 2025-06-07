import { Avatar, List } from "antd";
import cn from "classnames";

import styles from "./messages-list.module.scss";
import { memo } from "react";
import type { Message } from "../../../entities/message/index";

// import chatBackground from '../../../shared/assets/welcome-back.jpg';

interface MessagesListProps {
  messages: Message[];
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
}

const MessagesList = ({ messages, currentUserId }: MessagesListProps) => {
  return (
    <div className={styles.wrapper}>
      <List
        rowKey="id"
        className={styles.messageList}
        dataSource={messages}
        renderItem={(item) => {
          const isSelf = item.senderId == currentUserId;

          return (
            <List.Item className={cn(styles.messageItem, { [styles.self]: isSelf })}>
              {/* {!isSelf && <Avatar className={styles.avatar}>{item.senderId}</Avatar>} */}
              <div className={styles.messageContent}>
                <div className={styles.messageText}>{item.text}</div>
                <div className={styles.messageTime}>12:34</div> {/* временно, если нет данных */}
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default memo(MessagesList);
