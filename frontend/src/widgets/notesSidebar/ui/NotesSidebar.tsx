import {
  DeleteOutlined,
  FileAddOutlined,
  SearchOutlined,
  SettingOutlined,
  FolderOutlined,
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

const { Sider } = Layout;
const { Text } = Typography;

const NotesSidebar = () => {
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
      //   badge: 3,
    },
    {
      key: "starred",
      icon: <StarOutlined />,
      label: t("notes.starred"),
      tooltip: t("notes.starredTooltip"),
    },
    {
      key: "folders",
      icon: <FolderOutlined />,
      label: t("notes.folders"),
      tooltip: t("notes.foldersTooltip"),
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
      //   badge: 5,
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
    <Sider width={280} className={cn(styles.sidebar)}>
      <div className={styles.header}>
        <Avatar className={styles.avatar}>A</Avatar>
        <Text strong className={styles.username}>
          {userName}
        </Text>
      </div>
      <Menu mode="vertical" className={styles.menu}>
        {menuItems.map(({ key, icon, label, tooltip, badge, className }) => {
          const itemContent = (
            <span>
              {badge ? (
                <Badge count={badge} offset={[10, 0]}>
                  {icon}
                </Badge>
              ) : (
                icon
              )}
              <span>{label}</span>
            </span>
          );

          return (
            <Menu.Item
              key={key}
              icon={null} // иконка уже внутри itemContent
              className={cn(styles.menuItem, className)}
            >
              <Tooltip title={tooltip} placement="right">
                {itemContent}
              </Tooltip>
            </Menu.Item>
          );
        })}
      </Menu>
    </Sider>
  );
};

export default NotesSidebar;
