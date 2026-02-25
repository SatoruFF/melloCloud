// @ts-nocheck
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { message, Modal, Select, Input, Button } from "antd";
import cn from "classnames";
import { NotesToolbar } from "../../NotesToolbar";
import styles from "./editor.module.scss";
import "./editor.scss";

const NOTES_THEME_KEY = "notesEditorTheme";
const LIBRE_TRANSLATE_URL = "https://libretranslate.com/translate";

interface EditorProps {
  noteId?: string;
  noteTitle?: string;
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
  /** В полноэкранном режиме убирается рамка и скругления */
  fullscreen?: boolean;
}

export const Editor = ({
  noteId,
  noteTitle,
  initialContent,
  onSave,
  onContentChange,
  readOnly = false,
  className,
  toolbarProps = {},
  autoSave = true,
  autoSaveDelay = 2000,
  fullscreen = false,
}: EditorProps) => {
  const { t } = useTranslation();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<any>(initialContent);
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem(NOTES_THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [translateTargetLang, setTranslateTargetLang] = useState("ru");
  const [translatedText, setTranslatedText] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);

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

  // Track content changes and undo/redo state
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange?.((_editor, _context) => {
      const currentContent = editor.document;
      setHasUnsavedChanges(
        JSON.stringify(currentContent) !== JSON.stringify(lastSavedContent)
      );
      setCanUndo(true); // после изменений есть что отменять
      setCanRedo(false); // новый ввод сбрасывает redo-стек
      if (onContentChange) onContentChange(currentContent);
    });

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
      const didUndo = editor.undo();
      setCanRedo(true);
      if (!didUndo) setCanUndo(false);
    } catch (err) {
      console.error("Undo error:", err);
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (!editor) return;
    try {
      const didRedo = editor.redo();
      setCanUndo(true);
      if (!didRedo) setCanRedo(false);
    } catch (err) {
      console.error("Redo error:", err);
    }
  }, [editor]);

  const handleThemeChange = useCallback((theme: "light" | "dark") => {
    setEditorTheme(theme);
    try {
      localStorage.setItem(NOTES_THEME_KEY, theme);
    } catch {}
  }, []);

  const getDocumentPlainText = useCallback((): string => {
    if (!editor) return "";
    const doc = editor.document;
    if (!Array.isArray(doc)) return "";
    return doc
      .map((block: any) => {
        const content = block.content;
        if (Array.isArray(content)) return content.map((c: any) => c.text || "").join("");
        return typeof content === "string" ? content : "";
      })
      .join("\n\n");
  }, [editor]);

  const handleTranslateOpen = useCallback(() => {
    setTranslatedText("");
    setTranslateModalOpen(true);
  }, []);

  const handleTranslate = useCallback(async () => {
    const text = getDocumentPlainText();
    if (!text.trim()) {
      message.warning(t("notes.toolbar.translateEmpty"));
      return;
    }
    setTranslateLoading(true);
    setTranslatedText("");
    try {
      const res = await fetch(LIBRE_TRANSLATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text.slice(0, 5000),
          source: "auto",
          target: translateTargetLang,
          format: "text",
        }),
      });
      if (!res.ok) throw new Error("Translate API error");
      const data = (await res.json()) as { translatedText?: string };
      setTranslatedText(data.translatedText || "");
      if (!data.translatedText) message.warning(t("notes.toolbar.translateNoResult"));
    } catch (err) {
      console.error("Translate error:", err);
      message.error(t("notes.toolbar.translateError"));
    } finally {
      setTranslateLoading(false);
    }
  }, [getDocumentPlainText, translateTargetLang, t]);

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
    <div className={cn(styles.editorWrapper, className, { [styles.fullscreen]: fullscreen })}>
      <NotesToolbar
        noteId={noteId}
        noteTitle={noteTitle}
        onSave={handleSave}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        editorTheme={editorTheme}
        onThemeChange={handleThemeChange}
        onTranslate={handleTranslateOpen}
        hasUnsavedChanges={hasUnsavedChanges}
        className={cn(styles.toolbar)}
      />

      <div className={cn(styles.editorContainer)}>
        <div className={cn(styles.blocknoteContainer)}>
          <BlockNoteView editor={editor} className={cn(styles.editor)} editable={!readOnly} theme={editorTheme} />
        </div>
      </div>

      <Modal
        title={t("notes.toolbar.translateNote")}
        open={translateModalOpen}
        onCancel={() => setTranslateModalOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>{t("notes.toolbar.translateTo")}</label>
            <Select
              value={translateTargetLang}
              onChange={setTranslateTargetLang}
              options={[
                { value: "ru", label: "Русский" },
                { value: "en", label: "English" },
                { value: "de", label: "Deutsch" },
                { value: "es", label: "Español" },
                { value: "fr", label: "Français" },
              ]}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <Button type="primary" onClick={handleTranslate} loading={translateLoading} block>
              {translateLoading ? t("notes.toolbar.translating") : t("notes.toolbar.translate")}
            </Button>
          </div>
          {translatedText ? (
            <div>
              <label style={{ display: "block", marginBottom: 4 }}>{t("notes.toolbar.translationResult")}</label>
              <Input.TextArea readOnly value={translatedText} rows={8} style={{ resize: "vertical" }} />
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default Editor;
