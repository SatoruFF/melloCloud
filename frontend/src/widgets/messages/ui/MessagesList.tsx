import cn from "classnames";
import styles from "./messages-list.module.scss";
import { memo, useEffect, useRef, useCallback, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import type { Message } from "../../../entities/message";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

interface MessagesListProps {
  messages: Message[];
  currentUserId: number | undefined;
}

const MessagesList = ({ messages, currentUserId }: MessagesListProps) => {
  const { t } = useTranslation();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevMessagesLengthRef = useRef(messages.length);

  // Компонент для отображения сообщения
  const MessageItem = useCallback(
    ({ message }: { message: Message }) => {
      const isSelf = String(message.senderId) === String(currentUserId);
      const formattedTime = message.createdAt
        ? DateTime.fromISO(message.createdAt.toString()).toFormat("HH:mm")
        : message.time || "--:--";

      return (
        <div className={cn(styles.messageItem, { [styles.self]: isSelf })}>
          <div className={styles.messageContent}>
            <div className={styles.messageText}>{message.text}</div>
            <div className={styles.messageTime}>{formattedTime}</div>
          </div>
        </div>
      );
    },
    [currentUserId]
  );

  // Рендер элемента для виртуализации
  const itemContent = useCallback(
    (index: number) => {
      const message = messages[index];
      return <MessageItem message={message} />;
    },
    [messages, MessageItem]
  );

  // Скролл к низу при новых сообщениях
  useEffect(() => {
    if (messages.length === 0) return;

    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;

    if (isInitialLoad) {
      // При первой загрузке сразу скроллим вниз без анимации
      virtuosoRef.current?.scrollToIndex({
        index: currentLength - 1,
        behavior: "auto",
      });
      setIsInitialLoad(false);
    } else if (currentLength > prevLength) {
      // При новых сообщениях скроллим плавно
      virtuosoRef.current?.scrollToIndex({
        index: currentLength - 1,
        behavior: "smooth",
      });
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages.length, isInitialLoad]);

  // Альтернативный подход: startReached для подгрузки старых сообщений (пока не работает)
  const handleStartReached = useCallback(() => {
    console.log("Reached start - load more messages");
  }, []);

  if (messages.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyState}>
          <div>{t("messages.no-messages")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.messageList}>
        <Virtuoso
          ref={virtuosoRef}
          totalCount={messages.length}
          itemContent={itemContent}
          initialTopMostItemIndex={messages.length - 1} // Начинаем с последнего элемента
          followOutput="smooth" // Автоматически следуем за новыми сообщениями
          alignToBottom // Выравниваем по низу
          startReached={handleStartReached}
          style={{ height: "100%" }}
          className={styles.virtuosoContainer}
          components={{
            // Кастомный скроллер для лучшего контроля
            Scroller: ({ style, children, ...props }) => (
              <div
                {...props}
                style={{
                  ...style,
                  scrollBehavior: isInitialLoad ? "auto" : "smooth",
                }}
              >
                {children}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default memo(MessagesList);
