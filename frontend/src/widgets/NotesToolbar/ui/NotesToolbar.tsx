// NotesToolbar.tsx
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, message } from "antd";
import { Share2, Save, Download, Printer, MoreHorizontal, Undo, Redo, Bold, Italic, Underline } from "lucide-react";
import cn from "classnames";
import styles from "./notes-toolbar.module.scss";
import { ShareModal } from "../../../features/sharing/ui/ShareModal/ShareModal";
import { ResourceType } from "../../../entities/sharing";

interface NotesToolbarProps {
  noteId?: string;
  noteTitle?: string;
  onSave?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  className?: string;
}

export const NotesToolbar = ({
  noteId,
  noteTitle,
  onSave,
  onDownload,
  onPrint,
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onUnderline,
  canUndo = true,
  canRedo = true,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  className,
}: NotesToolbarProps) => {
  const { t } = useTranslation();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    } else {
      // Default save action
      message.success(t("notes.toolbar.saved"));
    }
  }, [onSave, t]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download action
      message.success(t("notes.toolbar.downloading"));
    }
  }, [onDownload, t]);

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print action
      window.print();
    }
  }, [onPrint]);

  const handleShare = useCallback(() => {
    if (!noteId || noteId === "new") {
      message.info(t("notes.share.selectNote"));
      return;
    }
    setShareModalOpen(true);
  }, [noteId, t]);

  return (
    <>
      <div className={cn(styles.toolbar, className)}>
        {/* Left Section - Main Actions */}
        <div className={cn(styles.toolbarSection, styles.toolbarLeft)}>
          <div className={cn(styles.buttonGroup)}>
            <Button
              icon={<Save size={16} />}
              onClick={handleSave}
              type="primary"
              className={cn(styles.toolbarButton, styles.saveBtn)}
            >
              {t("notes.toolbar.save")}
            </Button>
            <Button icon={<Share2 size={16} />} onClick={handleShare} className={cn(styles.toolbarButton)} type="text">
              {t("notes.toolbar.share")}
            </Button>
          </div>
        </div>

        {/* Center Section - Formatting */}
        <div className={cn(styles.toolbarSection, styles.toolbarCenter)}>
          <div className={cn(styles.buttonGroup, styles.formatGroup)}>
            <Button
              icon={<Undo size={16} />}
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              size="small"
            />
            <Button
              icon={<Redo size={16} />}
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              size="small"
            />
          </div>

          <div className={cn(styles.separator)} />

          <div className={cn(styles.buttonGroup, styles.formatGroup)}>
            <Button
              icon={<Bold size={16} />}
              onClick={onBold}
              className={cn(styles.toolbarButton, styles.iconButton, isBold && styles.active)}
              type="text"
              size="small"
            />
            <Button
              icon={<Italic size={16} />}
              onClick={onItalic}
              className={cn(styles.toolbarButton, styles.iconButton, isItalic && styles.active)}
              type="text"
              size="small"
            />
            <Button
              icon={<Underline size={16} />}
              onClick={onUnderline}
              className={cn(styles.toolbarButton, styles.iconButton, isUnderline && styles.active)}
              type="text"
              size="small"
            />
          </div>
        </div>

        {/* Right Section - Additional Actions */}
        <div className={cn(styles.toolbarSection, styles.toolbarRight)}>
          <div className={cn(styles.buttonGroup)}>
            <Button
              icon={<Download size={16} />}
              onClick={handleDownload}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              title={t("notes.toolbar.download")}
            />
            <Button
              icon={<Printer size={16} />}
              onClick={handlePrint}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              title={t("notes.toolbar.print")}
            />
            <Button
              icon={<MoreHorizontal size={16} />}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              title={t("notes.toolbar.more")}
            />
          </div>
        </div>
      </div>

      {/* Share Modal — реальный шаринг через API */}
      {noteId && noteId !== "new" && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          resourceType={ResourceType.NOTE}
          resourceId={Number(noteId)}
          resourceName={noteTitle || t("notes.untitled")}
        />
      )}
    </>
  );
};
