import React, { memo, type FC } from "react";
import { Editor } from "../../editor";
import { useTranslation } from "react-i18next";
import { Spinner } from "../../../shared";
import styles from "../styles/noteEditor.module.scss";
import cn from "classnames";

interface NoteEditorProps {
  noteId: string;
  title: string;
  content: any;
  isLoading?: boolean;
  isUpdating?: boolean;
  isCreating?: boolean;
  onTitleBlur: () => void;
  onTitleChange: (title: string) => void;
  onSave: (content: any) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const NoteEditor: FC<NoteEditorProps> = ({
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

  if (isLoading) {
    return (
      <div className={cn(styles.loading)}>
        <Spinner size="large" />
        <p>{t("notes.loading")}</p>
      </div>
    );
  }

  return (
    <div className={cn(styles.editorWrapper)}>
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
        <Editor initialContent={content} onSave={onSave} autoSave={autoSave} autoSaveDelay={autoSaveDelay} />
      </div>
    </div>
  );
};

export default memo(NoteEditor);
