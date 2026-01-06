import { Clock, Star, Tag, Trash2, Settings } from "lucide-react";
import { Avatar, Layout, Menu, Typography, Tooltip, Badge } from "antd";
import cn from "classnames";
import styles from "./notes-sidebar.module.scss";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import React, { memo } from "react";

const { Sider } = Layout;
const { Text } = Typography;

interface Props {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const NotesSidebar: React.FC<Props> = ({ collapsed, toggleCollapsed }) => {
  const { t } = useTranslation();
  const { userName } = useAppSelector(getUserSelector);

  const menuItems = [
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
    {
      key: "settings",
      icon: <Settings size={18} />,
      label: t("notes.settings"),
      tooltip: t("notes.settingsTooltip"),
      className: styles.bottomAction,
    },
  ];

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

      <Menu mode="vertical" className={styles.menu} selectable={false}>
        {menuItems.map(({ key, icon, label, tooltip, badge, className }) => (
          <Menu.Item key={key} className={cn(styles.menuItem, className)}>
            <Tooltip title={tooltip} placement="right">
              <span className={styles.menuItemInner}>
                {badge ? (
                  <Badge count={badge} offset={[10, 0]}>
                    {icon}
                  </Badge>
                ) : (
                  icon
                )}
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
