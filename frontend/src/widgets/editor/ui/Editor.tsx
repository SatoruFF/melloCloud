// Editor.tsx
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import cn from "classnames";
import { NotesToolbar } from "../../NotesToolbar";
import styles from "./editor.module.scss";
import "./editor.scss";

interface EditorProps {
  initialContent?: any;
  onSave?: (content: any) => void;
  onContentChange?: (content: any) => void;
  readOnly?: boolean;
  className?: string;
  toolbarProps?: {
    onDownload?: () => void;
    onPrint?: () => void;
  };
  shareProps?: {
    shareUrl?: string;
    initialCollaborators?: any[];
    onInviteUser?: (email: string, permission: "read" | "write") => void;
  };
}

export const Editor = ({
  initialContent,
  onSave,
  onContentChange,
  readOnly = false,
  className,
  toolbarProps = {},
  shareProps = {},
}: EditorProps) => {
  const { t } = useTranslation();
  const [isEditorReady, setIsEditorReady] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Create BlockNote editor
  const editor = useCreateBlockNote({
    initialContent,
  });

  const updateFormattingStates = useCallback(() => {
    if (!editor) return;

    // Update undo/redo states
    setCanUndo(true); // You can implement proper undo/redo state checking here
    setCanRedo(true);

    // Update formatting states
    // These would be based on the current selection in the editor
    // setIsBold(editor.getActiveStyles().bold);
    // setIsItalic(editor.getActiveStyles().italic);
    // setIsUnderline(editor.getActiveStyles().underline);
  }, [editor]);

  const handleSave = useCallback(() => {
    if (!editor) {
      message.error(t("notes.notReady"));
      return;
    }

    try {
      const content = editor.document;
      if (onSave) {
        onSave(content);
      } else {
        // Default save behavior
        // localStorage.setItem("editor-content", JSON.stringify(content));
        message.success(t("notes.toolbar.saved"));
      }
    } catch (error) {
      message.error(t("notes.saveFailed"));
      console.error("Save failed:", error);
    }
  }, [editor, onSave, t]);

  const handleDownload = useCallback(() => {
    if (!editor) {
      message.error(t("notes.notReady"));
      return;
    }

    if (toolbarProps.onDownload) {
      toolbarProps.onDownload();
    } else {
      // Default download behavior - export as JSON
      try {
        const content = editor.document;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "document.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        message.success(t("notes.toolbar.downloading"));
      } catch (error) {
        message.error(t("notes.editor.downloadFailed"));
        console.error("Download failed:", error);
      }
    }
  }, [editor, toolbarProps.onDownload, t]);

  const handlePrint = useCallback(() => {
    if (toolbarProps.onPrint) {
      toolbarProps.onPrint();
    } else {
      // Default print behavior
      window.print();
    }
  }, [toolbarProps.onPrint]);

  const handleUndo = useCallback(() => {
    if (!editor) return;
    // Implement undo functionality
    // editor.undo();
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (!editor) return;
    // Implement redo functionality
    // editor.redo();
  }, [editor]);

  const handleBold = useCallback(() => {
    if (!editor) return;
    // Implement bold formatting
    // editor.toggleBold();
    setIsBold(!isBold);
  }, [editor, isBold]);

  const handleItalic = useCallback(() => {
    if (!editor) return;
    // Implement italic formatting
    // editor.toggleItalic();
    setIsItalic(!isItalic);
  }, [editor, isItalic]);

  const handleUnderline = useCallback(() => {
    if (!editor) return;
    // Implement underline formatting
    // editor.toggleUnderline();
    setIsUnderline(!isUnderline);
  }, [editor, isUnderline]);

  return (
    <div className={cn(styles.editorWrapper, className)}>
      <NotesToolbar
        onSave={handleSave}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        canUndo={canUndo}
        canRedo={canRedo}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
        className={cn(styles.toolbar)}
      />

      <div className={cn(styles.editorContainer)}>
        <div className={cn(styles.blocknoteContainer)}>
          <BlockNoteView editor={editor} className={cn(styles.editor)} editable={!readOnly} />
        </div>

        {/* {!isEditorReady && (
          <div className={cn(styles.loadingOverlay)}>
            <div className={cn(styles.loadingSpinner)}>
              {t("editor.loading")}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Editor;
