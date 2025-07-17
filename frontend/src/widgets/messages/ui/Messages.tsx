import { Avatar, Input, Button, Empty, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { Send, Mic, Paperclip } from "lucide-react";
import MessagesList from "./MessagesList";
import styles from "./messages.module.scss";
import { useMessages } from "../hooks/useMessages";
import { useState } from "react";
import { useAppSelector } from "../../../app/store/store";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import { getUser } from "../../../entities/user/model/selectors/getUser";
import { ChatHeader } from "../../../features/chatHeader";

const Messages = () => {
  const { t } = useTranslation();
  const currentChat = useAppSelector(getCurrentChat);
  const currentUser = useAppSelector(getUser); // FIXME: public api
  const { id: currentUserId } = currentUser;
  const { messages, sendMessage } = useMessages();
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceMessage = () => {
    alert("Функция голосового сообщения пока не реализована");
  };

  const handleAttachFile = () => {
    alert("Функция прикрепления файла пока не реализована");
  };

  if (!currentChat) {
    return (
      <div className={styles.emptyWrapper}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>💬 {t("messages.start-new-chat")}</span>} />
      </div>
    );
  }

  return (
    <div className={styles.messagesWrapper}>
      <ChatHeader />
      <MessagesList messages={messages} currentUserId={currentUserId} />
      <div className={styles.inputWrapper}>
        <Input.TextArea
          placeholder={t("messages.messages-input-placeholder")}
          className={styles.textArea}
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleInputKeyDown}
        />
        <div className={styles.buttonsWrapper}>
          <Tooltip title="Голосовое сообщение">
            <Button
              type="text"
              icon={<Mic />}
              onClick={handleVoiceMessage}
              className={styles.voiceButton}
              aria-label="Voice message"
            />
          </Tooltip>
          <Tooltip title="Прикрепить файл">
            <Button
              type="text"
              icon={<Paperclip />}
              onClick={handleAttachFile}
              className={styles.attachButton}
              aria-label="Attach file"
            />
          </Tooltip>
          <Button
            type="text"
            icon={<Send />}
            onClick={handleSendMessage}
            className={styles.sendButton}
            aria-label="Send message"
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
