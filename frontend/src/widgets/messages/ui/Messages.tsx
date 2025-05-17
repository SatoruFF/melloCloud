import { Avatar, Input, Button } from "antd";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import MessagesList from "./MessagesList";
import styles from "./messages.module.scss";
import { useMessages } from "../hooks/useMessages";
import { useState } from "react";

const Messages = () => {
  const { t } = useTranslation();
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

  return (
    <div className={styles.messagesWrapper}>
      <MessagesList messages={messages} />
      <div className={styles.inputWrapper}>
        <Input.TextArea
          placeholder={t("messages.messages-input-placeholder")}
          className={styles.textArea}
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleInputKeyDown}
        />
        <Button type="text" icon={<Send />} onClick={handleSendMessage} className={styles.sendButton} />
      </div>
    </div>
  );
};

export default Messages;
