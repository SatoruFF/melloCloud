import {
  DeleteOutlined,
  FileAddOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  ClockCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Typography, Tooltip, Badge } from "antd";
import cn from "classnames";
import styles from "./notes-sidebar.module.scss";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import React from "react";

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
      key: "search",
      icon: <SearchOutlined />,
      label: t("notes.search"),
      tooltip: t("notes.searchTooltip"),
    },
    {
      key: "recent",
      icon: <ClockCircleOutlined />,
      label: t("notes.recent"),
      tooltip: t("notes.recentTooltip"),
    },
    {
      key: "starred",
      icon: <StarOutlined />,
      label: t("notes.starred"),
      tooltip: t("notes.starredTooltip"),
    },
    {
      key: "tags",
      icon: <TagOutlined />,
      label: t("notes.tags"),
      tooltip: t("notes.tagsTooltip"),
    },
    {
      key: "newPage",
      icon: <FileAddOutlined />,
      label: t("notes.newPage"),
      tooltip: t("notes.newPageTooltip"),
      className: styles.primaryAction,
    },
    {
      key: "trash",
      icon: <DeleteOutlined />,
      label: t("notes.trash"),
      tooltip: t("notes.trashTooltip"),
      className: styles.dangerAction,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
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

      <Menu mode="vertical" className={styles.menu}>
        {menuItems.map(({ key, icon, label, tooltip, badge, className }) => (
          <Menu.Item key={key} className={cn(styles.menuItem, className)}>
            <Tooltip title={tooltip} placement="right">
              <span>
                {badge ? (
                  <Badge count={badge} offset={[10, 0]}>
                    {icon}
                  </Badge>
                ) : (
                  icon
                )}

                {!collapsed && <span style={{ marginLeft: 12 }}>{label}</span>}
              </span>
            </Tooltip>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default NotesSidebar;
