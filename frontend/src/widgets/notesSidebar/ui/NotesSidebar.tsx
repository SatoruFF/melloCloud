// @ts-nocheck
import { FileText, Star, Tag, Trash2 } from "lucide-react";
import { Avatar, Layout, Menu, Typography, Tooltip } from "antd";
import cn from "classnames";
import styles from "./notes-sidebar.module.scss";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import React, { memo } from "react";
import type { NotesViewFilter } from "../../../entities/note/model/api/noteApi";

const { Sider } = Layout;
const { Text } = Typography;

interface Props {
  collapsed: boolean;
  toggleCollapsed: () => void;
  selectedView: NotesViewFilter;
  onViewChange: (view: NotesViewFilter) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const NotesSidebar: React.FC<Props> = ({
  collapsed,
  toggleCollapsed,
  selectedView,
  onViewChange,
  selectedTag,
  onTagSelect,
}) => {
  const { t } = useTranslation();
  const { userName } = useAppSelector(getUserSelector);

  const menuItems: { key: NotesViewFilter; icon: React.ReactNode; label: string; tooltip: string; className?: string }[] = [
    {
      key: "all",
      icon: <FileText size={18} />,
      label: t("notes.all") ?? "All",
      tooltip: t("notes.allTooltip") ?? "All notes",
    },
    {
      key: "starred",
      icon: <Star size={18} />,
      label: t("notes.starred"),
      tooltip: t("notes.starredTooltip"),
    },
    {
      key: "tags",
      icon: <Tag size={18} />,
      label: t("notes.tags"),
      tooltip: t("notes.tagsTooltip"),
    },
    {
      key: "trash",
      icon: <Trash2 size={18} />,
      label: t("notes.trash"),
      tooltip: t("notes.trashTooltip"),
      className: styles.dangerAction,
    },
  ];

  const handleMenuSelect = ({ key }: { key: string }) => {
    if (key === "tags") onTagSelect(null);
    onViewChange(key as NotesViewFilter);
  };

  return (
    <Sider
      width={280}
      collapsed={collapsed}
      collapsible
      onCollapse={toggleCollapsed}
      collapsedWidth={60}
      className={styles.sidebar}
    >
      {!collapsed && (
        <div className={styles.header}>
          <Avatar className={styles.avatar}>A</Avatar>
          <Text strong className={styles.username}>
            {userName}
          </Text>
        </div>
      )}

      <Menu
        mode="vertical"
        className={styles.menu}
        selectedKeys={[selectedView]}
        onSelect={handleMenuSelect}
      >
        {menuItems.map(({ key, icon, label, tooltip, className }) => (
          <Menu.Item key={key} className={cn(styles.menuItem, className)}>
            <Tooltip title={tooltip} placement="right">
              <span className={styles.menuItemInner}>
                {icon}
                {!collapsed && <span className={styles.menuLabel}>{label}</span>}
              </span>
            </Tooltip>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default memo(NotesSidebar);
