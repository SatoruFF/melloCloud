import { Avatar, List } from "antd";
import cn from "classnames";
import styles from "./messages-list.module.scss";
import { memo, useEffect, useRef } from "react";
import type { Message } from "../../../entities/message";
import { DateTime } from "luxon";

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
}

const MessagesList = ({ messages, currentUserId }: MessagesListProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = listRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.messageList} ref={listRef}>
        <List
          dataSource={messages}
          renderItem={(item) => {
            const isSelf = item.senderId === currentUserId;
            const formattedTime = item.createdAt
              ? DateTime.fromISO(item.createdAt.toString()).toFormat("HH:mm")
              : item.time || "--:--";

            return (
              <List.Item className={cn(styles.messageItem, { [styles.self]: isSelf })}>
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{item.text}</div>
                  <div className={styles.messageTime}>{formattedTime}</div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default memo(MessagesList);
