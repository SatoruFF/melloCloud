import { useSelector } from "react-redux";
import styles from "./chat-header.module.scss";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import { UserIcon } from "lucide-react";

const ChatHeader = () => {
  const chat = useSelector(getCurrentChat);

  if (!chat || !chat.receiver) {
    return null;
  }

  const { avatar, userName, status } = chat.receiver;

  return (
    <div className={styles.chatHeader}>
      {avatar ? (
        <img src={avatar} alt={userName} className={styles.avatar} />
      ) : (
        <div className={styles.avatarFallback}>
          <UserIcon size={24} />
        </div>
      )}
      <div className={styles.chatInfo}>
        <span className={styles.chatName}>{userName}</span>
        {status && <span className={styles.chatStatus}>{status}</span>}
      </div>
    </div>
  );
};

export default ChatHeader;
