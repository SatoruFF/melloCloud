import { Avatar, List } from "antd";
import cn from "classnames";

import styles from "./messages-list.module.scss";
import { memo } from "react";
import type { Message } from "../../../entities/message/index";

// import chatBackground from '../../../shared/assets/welcome-back.jpg';

interface MessagesListProps {
  messages: Message[];
}

const MessagesList = ({ messages }: MessagesListProps) => {
  return (
    <div className={styles.wrapper}>
      {/* <img src={chatBackground} loading="lazy" alt="" aria-hidden className={styles.lazyBackground} /> */}

      <List
        className={styles.messageList}
        dataSource={messages}
        renderItem={(item) => (
          <List.Item className={cn(styles.messageItem, { [styles.self]: item.self })}>
            {!item.self && <Avatar className={styles.avatar}>{item.sender[0]}</Avatar>}
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{item.text}</div>
              <div className={styles.messageTime}>{item.time}</div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default memo(MessagesList);
