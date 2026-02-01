// NotesToolbar.tsx
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { Share2, Save, Download, Printer, MoreHorizontal, Undo, Redo, Sun, Moon, Languages } from "lucide-react";
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
  canUndo?: boolean;
  canRedo?: boolean;
  editorTheme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
  onTranslate?: () => void;
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
  canUndo = true,
  canRedo = true,
  editorTheme = "light",
  onThemeChange,
  onTranslate,
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

  const moreMenuItems: MenuProps["items"] = [
    {
      key: "theme",
      label: t("notes.toolbar.theme"),
      icon: editorTheme === "dark" ? <Moon size={14} /> : <Sun size={14} />,
      children: [
        {
          key: "theme-light",
          label: t("notes.toolbar.themeLight"),
          icon: <Sun size={14} />,
          onClick: () => onThemeChange?.("light"),
        },
        {
          key: "theme-dark",
          label: t("notes.toolbar.themeDark"),
          icon: <Moon size={14} />,
          onClick: () => onThemeChange?.("dark"),
        },
      ],
    },
    {
      key: "translate",
      icon: <Languages size={14} />,
      label: t("notes.toolbar.translate"),
      onClick: onTranslate,
    },
  ];

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

        {/* Center Section - Undo/Redo */}
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
            <Dropdown menu={{ items: moreMenuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                icon={<MoreHorizontal size={16} />}
                className={cn(styles.toolbarButton, styles.iconButton)}
                type="text"
                title={t("notes.toolbar.more")}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
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
