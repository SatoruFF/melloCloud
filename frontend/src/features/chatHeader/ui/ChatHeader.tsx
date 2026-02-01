import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./chat-header.module.scss";
import { getCurrentChat } from "../../../entities/chat";
import { getUserSelector } from "../../../entities/user";
import { UserIcon, Users, ChevronRight, Video } from "lucide-react";
import { ChatProfileDrawer } from "./ChatProfileDrawer";
import { CALL_ROUTE } from "../../../shared/consts/routes";

const getCallRoomName = (chatId: string | number | null): string => {
  if (chatId == null) return "mellocloud-call";
  const safe = String(chatId).replace(/[^a-zA-Z0-9-_]/g, "");
  return safe ? `mellocloud-chat-${safe}` : "mellocloud-call";
};

const ChatHeader = () => {
  const { t } = useTranslation();
  const chat = useSelector(getCurrentChat);
  const currentUser = useSelector(getUserSelector);
  const [profileOpen, setProfileOpen] = useState(false);
  const openProfile = useCallback(() => setProfileOpen(true), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  const openVideoCall = useCallback(() => {
    if (!chat?.id) return;
    const room = getCallRoomName(chat.id);
    const displayName = currentUser?.userName ?? t("chats.videoCall.guest");
    const params = new URLSearchParams({
      room,
      displayName: displayName.trim() || t("chats.videoCall.guest"),
    });
    const url = `${window.location.origin}${CALL_ROUTE}?${params.toString()}`;
    window.open(url, "mellocloud-video-call", "width=960,height=700,scrollbars=no,resizable=yes");
  }, [chat?.id, currentUser?.userName, t]);

  if (!chat) return null;

  const headerContent =
    chat.isGroup ? (
      <>
        <div className={styles.avatarFallback}>
          <Users size={24} />
        </div>
        <div className={styles.chatInfo}>
          <span className={styles.chatName}>{chat.title || `Группа #${chat.id}`}</span>
        </div>
        <ChevronRight className={styles.chevron} size={20} />
      </>
    ) : chat.receiver ? (
      <>
        {chat.receiver.avatar ? (
          <img src={chat.receiver.avatar} alt={chat.receiver.userName} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            <UserIcon size={24} />
          </div>
        )}
        <div className={styles.chatInfo}>
          <span className={styles.chatName}>{chat.receiver.userName}</span>
          {chat.receiver.status && (
            <span className={styles.chatStatus}>{chat.receiver.status}</span>
          )}
        </div>
        <ChevronRight className={styles.chevron} size={20} />
      </>
    ) : null;

  if (!headerContent) return null;

  return (
    <>
      <div className={styles.headerRow}>
        <button
          type="button"
          className={styles.chatHeader}
          onClick={openProfile}
          aria-label={t("chats.chat-info")}
        >
          {headerContent}
        </button>
        <button
          type="button"
          className={styles.videoCallBtn}
          onClick={openVideoCall}
          aria-label={t("chats.videoCall.start")}
          title={t("chats.videoCall.start")}
        >
          <Video size={20} />
        </button>
      </div>
      <ChatProfileDrawer open={profileOpen} onClose={closeProfile} />
    </>
  );
};

export default ChatHeader;
