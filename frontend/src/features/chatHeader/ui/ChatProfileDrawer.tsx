import { Drawer } from "antd";
import { UserIcon, Users, FileText, Image, Link2, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getCurrentChat } from "../../../entities/chat";
import type { Chat } from "../../../entities/chat/model/api/chatApi";
import styles from "./chat-profile-drawer.module.scss";

interface ChatProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Панель информации о чате (как в Telegram: профиль + в будущем файлы, медиа, ссылки).
 */
export const ChatProfileDrawer = ({ open, onClose }: ChatProfileDrawerProps) => {
  const { t } = useTranslation();
  const chat = useSelector(getCurrentChat) as Chat | null;

  if (!chat) return null;

  const isGroup = Boolean(chat.isGroup);
  const displayName = isGroup ? (chat.title || `Группа #${chat.id}`) : chat.receiver?.userName ?? "";
  const avatar = chat.receiver?.avatar;

  return (
    <Drawer
      title={t("chats.chat-info") ?? "Информация о чате"}
      placement="right"
      width={360}
      onClose={onClose}
      open={open}
      className={styles.drawer}
      destroyOnClose
    >
      <div className={styles.profileBlock}>
        <div className={styles.avatarWrap}>
          {avatar ? (
            <img src={avatar} alt={displayName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>
              {isGroup ? <Users size={48} /> : <UserIcon size={48} />}
            </div>
          )}
        </div>
        <h2 className={styles.displayName}>{displayName}</h2>
        {!isGroup && chat.receiver && (
          <p className={styles.subtitle}>{t("chats.contact") ?? "Контакт"}</p>
        )}
      </div>

      <nav className={styles.sections} aria-label={t("chats.chat-sections") ?? "Разделы чата"}>
        {/* Участники группы — позже список участников */}
        {isGroup && (
          <SectionRow
            icon={<UserPlus size={20} />}
            label={t("chats.participants") ?? "Участники"}
            hint={t("chats.coming-soon") ?? "Скоро"}
          />
        )}

        {/* Общие файлы — позже список файлов из чата */}
        <SectionRow
          icon={<FileText size={20} />}
          label={t("chats.shared-files") ?? "Общие файлы"}
          hint={t("chats.coming-soon") ?? "Скоро"}
        />

        {/* Медиа — позже фото/видео из чата */}
        <SectionRow
          icon={<Image size={20} />}
          label={t("chats.media") ?? "Медиа"}
          hint={t("chats.coming-soon") ?? "Скоро"}
        />

        {/* Ссылки — позже ссылки из сообщений */}
        <SectionRow
          icon={<Link2 size={20} />}
          label={t("chats.links") ?? "Ссылки"}
          hint={t("chats.coming-soon") ?? "Скоро"}
        />
      </nav>
    </Drawer>
  );
};

function SectionRow({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <button type="button" className={styles.sectionRow} disabled>
      <span className={styles.sectionIcon}>{icon}</span>
      <span className={styles.sectionLabel}>{label}</span>
      {hint && <span className={styles.sectionHint}>{hint}</span>}
    </button>
  );
}
