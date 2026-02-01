import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import styles from "./chat-header.module.scss";
import { getCurrentChat } from "../../../entities/chat";
import { UserIcon, Users, ChevronRight } from "lucide-react";
import { ChatProfileDrawer } from "./ChatProfileDrawer";

const ChatHeader = () => {
  const chat = useSelector(getCurrentChat);
  const [profileOpen, setProfileOpen] = useState(false);
  const openProfile = useCallback(() => setProfileOpen(true), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  if (!chat) return null;

  if (chat.isGroup) {
    return (
      <>
        <button
          type="button"
          className={styles.chatHeader}
          onClick={openProfile}
          aria-label="Информация о чате"
        >
          <div className={styles.avatarFallback}>
            <Users size={24} />
          </div>
          <div className={styles.chatInfo}>
            <span className={styles.chatName}>{chat.title || `Группа #${chat.id}`}</span>
          </div>
          <ChevronRight className={styles.chevron} size={20} />
        </button>
        <ChatProfileDrawer open={profileOpen} onClose={closeProfile} />
      </>
    );
  }

  if (!chat.receiver) return null;

  const { avatar, userName, status } = chat.receiver;

  return (
    <>
      <button
        type="button"
        className={styles.chatHeader}
        onClick={openProfile}
        aria-label="Профиль контакта"
      >
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
        <ChevronRight className={styles.chevron} size={20} />
      </button>
      <ChatProfileDrawer open={profileOpen} onClose={closeProfile} />
    </>
  );
};

export default ChatHeader;
