import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Popconfirm } from "antd";
import { Star, Trash2 } from "lucide-react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./noteCard.module.scss";

interface NoteCardProps {
  note: {
    id: number;
    title: string;
    content: any;
    updatedAt: string;
    isStarred?: boolean;
    tags?: string[];
  };
  onDelete: (id: number) => void;
  onToggleStar: (id: number, isStarred: boolean) => void;
  isDeleting?: boolean;
}

const extractTextContent = (content: any): string => {
  if (!content) return "";
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block.content) {
          if (typeof block.content === "string") return block.content;
          if (Array.isArray(block.content)) {
            return block.content.map((item: any) => (typeof item === "string" ? item : item.text || "")).join("");
          }
        }
        return block.text || "";
      })
      .join(" ");
  }
  return "";
};

const formatDate = (dateString: string, t: any) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return t("notes.today");
  if (days === 1) return t("notes.yesterday");
  if (days < 7) return t("notes.daysAgo", { count: days });
  return date.toLocaleDateString();
};

export const NoteCard: React.FC<NoteCardProps> = memo(({ note, onDelete, onToggleStar, isDeleting }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const textContent = extractTextContent(note.content);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(`.${styles.actionBtn}`) ||
      target.closest(`.${styles.noteActions}`) ||
      target.closest(`.${styles.starBtn}`)
    ) {
      return;
    }
    navigate(`/notes/${note.id}`);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar(note.id, !note.isStarred);
  };

  console.log("Note tags:", note.tags); // Для отладки

  return (
    <div className={cn(styles.noteCard)} onClick={handleCardClick}>
      {/* Star Button - теперь слева */}
      <button
        className={cn(styles.starBtn, { [styles.starred]: note.isStarred })}
        onClick={handleStarClick}
        title={note.isStarred ? t("notes.unstar") : t("notes.star")}
        type="button"
      >
        <Star size={18} fill={note.isStarred ? "currentColor" : "none"} />
      </button>

      <div className={cn(styles.noteHeader)}>
        <h3>{note.title || t("notes.untitled")}</h3>
        <div className={cn(styles.noteActions)} onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title={t("notes.deleteConfirm")}
            okText={t("common.yes")}
            cancelText={t("common.no")}
            onConfirm={() => onDelete(note.id)}
            placement="topRight"
          >
            <button
              type="button"
              className={cn(styles.actionBtn, styles.deleteBtn)}
              onClick={(e) => e.stopPropagation()}
              title={t("notes.delete")}
              disabled={isDeleting}
            >
              <Trash2 size={16} />
            </button>
          </Popconfirm>
        </div>
      </div>

      <p className={cn(styles.noteContent)}>
        {textContent.slice(0, 120)}
        {textContent.length > 120 && "..."}
      </p>

      {/* Tags - всегда рендерим, даже если пусто */}
      <div className={cn(styles.noteTags)}>
        {note.tags && note.tags.length > 0 ? (
          <>
            {note.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={cn(styles.tag)}>
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && <span className={cn(styles.tagMore)}>+{note.tags.length - 3}</span>}
          </>
        ) : null}
      </div>

      <div className={cn(styles.noteFooter)}>
        <span className={cn(styles.noteDate)}>{formatDate(note.updatedAt, t)}</span>
      </div>
    </div>
  );
});

NoteCard.displayName = "NoteCard";
