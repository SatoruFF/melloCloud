import {
  MessageSquare,
  FileText,
  CalendarCheck,
  Blocks,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Dropdown, type MenuProps, Space } from "antd";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { CHATS_ROUTE, FILE_ROUTE, NOTES_ROUTE, MODULES_ROUTE, PLANNER_ROUTE, ADMIN_ROUTE } from "../../../shared/consts/routes";
import { getFeatureFlag } from "../../../shared/lib/features/setGetFeatures";

const WorkspacesDropdown = ({ viewAll, logOut, setProfile, isAdmin }: { viewAll: boolean; logOut: any; setProfile: any; isAdmin?: boolean }) => {
  const { t } = useTranslation();

  const items: MenuProps["items"] = [
    ...(getFeatureFlag("chats")
      ? [
          {
            key: "1",
            label: <NavLink to={CHATS_ROUTE}>{t("tabs.chats")}</NavLink>,
            icon: <MessageSquare size={16} />,
          },
        ]
      : []),
    ...(getFeatureFlag("notes")
      ? [
          {
            key: "2",
            label: <NavLink to={NOTES_ROUTE}>{t("tabs.notes")}</NavLink>,
            icon: <FileText size={16} />,
          },
        ]
      : []),
    ...(getFeatureFlag("planner")
      ? [
          {
            key: "3",
            label: <NavLink to={PLANNER_ROUTE}>{t("tabs.planner")}</NavLink>,
            icon: <CalendarCheck size={16} />,
          },
        ]
      : []),
    ...(getFeatureFlag("kanban")
      ? [
          {
            key: "4",
            label: <NavLink to={MODULES_ROUTE}>{t("tabs.modules")}</NavLink>,
            danger: true,
            icon: <Blocks size={16} />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: <NavLink to={ADMIN_ROUTE}>{t("tabs.admin-panel")}</NavLink>,
            icon: <Shield size={16} />,
          },
        ]
      : []),
  ];

  if (viewAll) {
    if (getFeatureFlag("files")) {
      items.push({
        key: "6",
        label: <NavLink to={FILE_ROUTE}>{t("tabs.files")}</NavLink>,
        icon: <FolderOpen size={16} />,
      });
    }
    items.push(
      {
        key: "7",
        label: <div onClick={() => setProfile(true)}>{t("tabs.settings")}</div>,
        icon: <Settings size={16} />,
      },
      {
        key: "8",
        label: <div onClick={() => logOut()}>{t("auth.logout")}</div>,
        icon: <LogOut size={16} />,
      }
    );
  }

  return (
    <Dropdown menu={{ items }}>
      <Space style={{ cursor: "pointer", paddingRight: "30px", color: "#fff" }}>
        {t("workspace")}
        <ChevronDown size={16} />
      </Space>
    </Dropdown>
  );
};

export default WorkspacesDropdown;
