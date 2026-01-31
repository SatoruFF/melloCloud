import React, { memo, useCallback, type FC } from "react";
import { Editor } from "../../editor";
import { Spin, Avatar, Tooltip, Badge } from "antd";
import { useTranslation } from "react-i18next";
import { useNoteCollaboration } from "../../../shared";
import { Users } from "lucide-react";
import styles from "../styles/noteEditor.module.scss";
import cn from "classnames";

export interface CollaborativeNoteEditorProps {
  noteId: string;
  title: string;
  content: unknown;
  isLoading?: boolean;
  isUpdating?: boolean;
  isCreating?: boolean;
  onTitleBlur: () => void;
  onTitleChange: (title: string) => void;
  onSave: (content: unknown) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const CollaborativeNoteEditor: FC<CollaborativeNoteEditorProps> = ({
  noteId,
  title,
  content,
  isLoading,
  isUpdating,
  isCreating,
  onTitleChange,
  onTitleBlur,
  onSave,
  autoSave = true,
  autoSaveDelay = 2000,
}) => {
  const { t } = useTranslation();

  const { collaborators, isConnected } = useNoteCollaboration({
    noteId,
    onContentUpdate: (data) => {
      // Применение изменений от других пользователей (TODO: интеграция с BlockNote/OT)
      console.log("[Collab] Content update from server:", data);
    },
    onConflict: (serverVersion) => {
      console.warn("[Collab] Version conflict, server version:", serverVersion);
    },
  });

  const handleSave = useCallback(
    (savedContent: unknown) => {
      onSave(savedContent);
    },
    [onSave],
  );

  if (isLoading) {
    return (
      <div className={cn(styles.loading)}>
        <Spin size="large" />
        <p>{t("notes.loading")}</p>
      </div>
    );
  }

  return (
    <div className={cn(styles.editorWrapper)}>
      {/* Collaborators bar — только для существующей заметки */}
      {noteId !== "new" && (
        <div className={cn(styles.collaboratorsBar)}>
          <div className={cn(styles.collaboratorsLeft)}>
            <Badge status={isConnected ? "success" : "default"} />
            <Users size={16} className={styles.collaboratorsIcon} />
            <span>
              {t("notes.sharing.collaborators")} ({collaborators.length})
            </span>
          </div>
          <div className={cn(styles.collaboratorsList)}>
            <Avatar.Group maxCount={5}>
              {collaborators.map((collab) => (
                <Tooltip
                  key={collab.userId}
                  title={`${collab.userName} (${t("notes.sharing.online")})`}
                >
                  <Avatar
                    src={collab.avatar}
                    style={{
                      backgroundColor: collab.color,
                      border: `2px solid ${collab.color}`,
                    }}
                  >
                    {(collab.userName || `U${collab.userId}`).slice(0, 1).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          </div>
        </div>
      )}

      {/* Title */}
      <div className={cn(styles.titleContainer)}>
        <input
          type="text"
          className={cn(styles.titleInput)}
          value={title}
          onBlur={onTitleBlur}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t("notes.untitled")}
          disabled={isUpdating || isCreating}
        />
      </div>

      {/* Content Editor */}
      <div className={cn(styles.editorContent)}>
        <Editor
          initialContent={content}
          onSave={handleSave}
          autoSave={autoSave}
          autoSaveDelay={autoSaveDelay}
        />
      </div>
    </div>
  );
};

export default memo(CollaborativeNoteEditor);
