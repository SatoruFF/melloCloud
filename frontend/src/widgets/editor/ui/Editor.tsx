import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useState, useCallback, useEffect } from "react";
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
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const Editor = ({
  initialContent,
  onSave,
  onContentChange,
  readOnly = false,
  className,
  toolbarProps = {},
  autoSave = true,
  autoSaveDelay = 2000,
}: EditorProps) => {
  const { t } = useTranslation();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<any>(initialContent);

  // Create BlockNote editor
  const editor = useCreateBlockNote({
    initialContent,
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !editor) return;

    const saveTimer = setTimeout(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, autoSaveDelay);

    return () => clearTimeout(saveTimer);
  }, [hasUnsavedChanges, autoSave, autoSaveDelay]);

  // Track content changes
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const currentContent = editor.document;

      // Check if content has actually changed
      const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(lastSavedContent);

      if (contentChanged) {
        setHasUnsavedChanges(true);

        if (onContentChange) {
          onContentChange(currentContent);
        }
      }
    };

    // Subscribe to editor changes
    // Note: BlockNote may have different event system, adjust accordingly
    const unsubscribe = editor.onChange?.(handleChange);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [editor, lastSavedContent, onContentChange]);

  const handleSave = useCallback(async () => {
    if (!editor) {
      message.error(t("notes.notReady"));
      return;
    }

    try {
      const content = editor.document;

      if (onSave) {
        await onSave(content);
        setLastSavedContent(content);
        setHasUnsavedChanges(false);
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
      try {
        const content = editor.document;

        // Export as Markdown
        const markdown = blocksToMarkdown(content);
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        message.success(t("notes.toolbar.downloading"));
      } catch (error) {
        message.error(t("notes.editor.downloadFailed"));
        console.error("Download failed:", error);
      }
    }
  }, [editor, toolbarProps, t]);

  const blocksToMarkdown = (blocks: any[]): string => {
    if (!Array.isArray(blocks)) return "";

    return blocks
      .map((block) => {
        const content = Array.isArray(block.content)
          ? block.content.map((item: any) => item.text || "").join("")
          : block.content || "";

        switch (block.type) {
          case "heading":
            const level = block.props?.level || 1;
            return "#".repeat(level) + " " + content;
          case "bulletListItem":
            return "- " + content;
          case "numberedListItem":
            return "1. " + content;
          case "paragraph":
          default:
            return content;
        }
      })
      .join("\n\n");
  };

  const handlePrint = useCallback(() => {
    if (toolbarProps.onPrint) {
      toolbarProps.onPrint();
    } else {
      window.print();
    }
  }, [toolbarProps]);

  const handleUndo = useCallback(() => {
    if (!editor) return;
    try {
      editor.undo?.();
      setCanUndo(editor.canUndo?.() ?? false);
      setCanRedo(editor.canRedo?.() ?? true);
    } catch (err) {
      console.error("Undo error:", err);
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (!editor) return;
    try {
      editor.redo?.();
      setCanRedo(editor.canRedo?.() ?? false);
      setCanUndo(editor.canUndo?.() ?? true);
    } catch (err) {
      console.error("Redo error:", err);
    }
  }, [editor]);

  const handleBold = useCallback(() => {
    if (!editor) return;
    try {
      editor.toggleStyles?.({ bold: true });
    } catch (err) {
      console.error("Bold error:", err);
    }
  }, [editor]);

  const handleItalic = useCallback(() => {
    if (!editor) return;
    try {
      editor.toggleStyles?.({ italic: true });
    } catch (err) {
      console.error("Italic error:", err);
    }
  }, [editor]);

  const handleUnderline = useCallback(() => {
    if (!editor) return;
    try {
      editor.toggleStyles?.({ underline: true });
    } catch (err) {
      console.error("Underline error:", err);
    }
  }, [editor]);

  // Update formatting states based on selection
  useEffect(() => {
    if (!editor) return;

    const updateStates = () => {
      setCanUndo(editor.canUndo?.() ?? false);
      setCanRedo(editor.canRedo?.() ?? false);
    };

    updateStates();
  }, [editor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

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
        isBold={false}
        isItalic={false}
        isUnderline={false}
        hasUnsavedChanges={hasUnsavedChanges}
        className={cn(styles.toolbar)}
      />

      <div className={cn(styles.editorContainer)}>
        <div className={cn(styles.blocknoteContainer)}>
          <BlockNoteView editor={editor} className={cn(styles.editor)} editable={!readOnly} theme="light" />
        </div>
      </div>
    </div>
  );
};

export default Editor;
