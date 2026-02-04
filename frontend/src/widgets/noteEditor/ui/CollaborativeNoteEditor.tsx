import React, { memo, useCallback, useEffect, type FC } from "react";
import { Editor } from "../../editor";
import { Avatar, Tooltip, Badge } from "antd";
import { useTranslation } from "react-i18next";
import { Spinner } from "../../../shared";
import { useYjsCollaboration } from "../../../shared/lib/hooks/useYjsCollaboration";
import { Users, Maximize2, Minimize2 } from "lucide-react";
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
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
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
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const { t } = useTranslation();

  const { isConnected, collaborators, updateContent } = useYjsCollaboration({
    noteId,
    initialContent: content,
    onContentUpdate: (updatedContent) => {
      // Контент обновлен через Yjs, можно обновить Editor если нужно
      console.log("[YjsCollab] Content updated:", updatedContent);
    },
  });

  // Обновлять Yjs при изменении контента в Editor
  useEffect(() => {
    if (content && updateContent) {
      const contentArray = Array.isArray(content) ? content : [content];
      updateContent(contentArray);
    }
  }, [content, updateContent]);

  const handleSave = useCallback(
    (savedContent: unknown) => {
      onSave(savedContent);
    },
    [onSave]
  );

  if (isLoading) {
    return (
      <div className={cn(styles.loading)}>
        <Spinner size="large" />
        <p>{t("notes.loading")}</p>
      </div>
    );
  }

  return (
    <div className={cn(styles.editorWrapper, { [styles.fullscreen]: isFullscreen })}>
      {/* Collaborators bar — только для существующей заметки */}
      {noteId !== "new" && (
        <div className={cn(styles.collaboratorsBar)}>
          <div className={cn(styles.collaboratorsLeft)}>
            <Badge status={isConnected ? "success" : "default"} />
            <Users size={16} className={styles.collaboratorsIcon} />
            <span>
              {t("notes.share.collaborators")} ({collaborators.length})
            </span>
          </div>
          <div className={cn(styles.collaboratorsList)}>
            <Avatar.Group maxCount={5}>
              {collaborators.map((collab) => (
                <Tooltip key={collab.userId} title={`${collab.userName} (${t("notes.share.online")})`}>
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

      {/* Title + Fullscreen */}
      <div className={cn(styles.titleRow)}>
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
        {onToggleFullscreen && (
          <Tooltip title={isFullscreen ? t("notes.exitFullscreen") : t("notes.fullscreen")}>
            <button
              type="button"
              className={cn(styles.fullscreenButton)}
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? t("notes.exitFullscreen") : t("notes.fullscreen")}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </Tooltip>
        )}
      </div>

      {/* Content Editor */}
      <div className={cn(styles.editorContent)}>
        <Editor
          noteId={noteId}
          noteTitle={title}
          initialContent={content}
          onSave={handleSave}
          autoSave={autoSave}
          autoSaveDelay={autoSaveDelay}
          fullscreen={isFullscreen}
        />
      </div>
    </div>
  );
};

export default memo(CollaborativeNoteEditor);
