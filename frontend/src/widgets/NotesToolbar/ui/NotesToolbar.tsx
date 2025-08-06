// NotesToolbar.tsx
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, message } from "antd";
import {
  ShareAltOutlined,
  SaveOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MoreOutlined,
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
import cn from "classnames";
import styles from "./notes-toolbar.module.scss";
import { ShareNotesDrawer } from "../../../features/shareNotesDrawer";

interface NotesToolbarProps {
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
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);

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
    setShareDrawerOpen(true);
  }, []);

  return (
    <>
      <div className={cn(styles.toolbar, className)}>
        {/* Left Section - Main Actions */}
        <div className={cn(styles.toolbarSection, styles.toolbarLeft)}>
          <div className={cn(styles.buttonGroup)}>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSave}
              className={cn(styles.toolbarButton)}
              type="text"
            >
              {t("notes.toolbar.save")}
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              className={cn(styles.toolbarButton)}
              type="text"
            >
              {t("notes.toolbar.share")}
            </Button>
          </div>
        </div>

        {/* Center Section - Formatting */}
        <div className={cn(styles.toolbarSection, styles.toolbarCenter)}>
          <div className={cn(styles.buttonGroup, styles.formatGroup)}>
            <Button
              icon={<UndoOutlined />}
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              size="small"
            />
            <Button
              icon={<RedoOutlined />}
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
              icon={<BoldOutlined />}
              onClick={onBold}
              className={cn(
                styles.toolbarButton,
                styles.iconButton,
                isBold && styles.active,
              )}
              type="text"
              size="small"
            />
            <Button
              icon={<ItalicOutlined />}
              onClick={onItalic}
              className={cn(
                styles.toolbarButton,
                styles.iconButton,
                isItalic && styles.active,
              )}
              type="text"
              size="small"
            />
            <Button
              icon={<UnderlineOutlined />}
              onClick={onUnderline}
              className={cn(
                styles.toolbarButton,
                styles.iconButton,
                isUnderline && styles.active,
              )}
              type="text"
              size="small"
            />
          </div>
        </div>

        {/* Right Section - Additional Actions */}
        <div className={cn(styles.toolbarSection, styles.toolbarRight)}>
          <div className={cn(styles.buttonGroup)}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              title={t("notes.toolbar.download")}
            />
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              title={t("notes.toolbar.print")}
            />
            <Button
              icon={<MoreOutlined />}
              className={cn(styles.toolbarButton, styles.iconButton)}
              type="text"
              title={t("notes.toolbar.more")}
            />
          </div>
        </div>
      </div>

      {/* Share Drawer */}
      <ShareNotesDrawer
        open={shareDrawerOpen}
        onClose={() => setShareDrawerOpen(false)}
      />
    </>
  );
};
