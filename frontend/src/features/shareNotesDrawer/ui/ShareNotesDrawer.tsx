// ShareDrawer.tsx
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Drawer,
  Space,
  Input,
  Button,
  Tooltip,
  Select,
  Switch,
  List,
  Avatar,
  Badge,
  Tag,
  Typography,
  message,
  Divider,
} from "antd";
import {
  TeamOutlined,
  CopyOutlined,
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
  LinkOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import cn from "classnames";
import styles from "./share-notes.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permission: "read" | "write" | "admin";
  isOnline: boolean;
  lastSeen?: Date;
}

interface ShareSettings {
  isPublic: boolean;
  allowCopy: boolean;
  allowDownload: boolean;
  allowComments: boolean;
  expiresAt?: Date;
}

interface ShareDrawerProps {
  open: boolean;
  onClose: () => void;
  shareUrl?: string;
  initialCollaborators?: Collaborator[];
  initialSettings?: ShareSettings;
  onInviteUser?: (email: string, permission: "read" | "write") => void;
  onRemoveCollaborator?: (userId: string) => void;
  onChangePermission?: (
    userId: string,
    permission: "read" | "write" | "admin",
  ) => void;
  onSettingsChange?: (settings: ShareSettings) => void;
  className?: string;
}

export const ShareNotesDrawer = ({
  open,
  onClose,
  shareUrl = "https://notes.app/share/abc123",
  initialCollaborators = [],
  initialSettings = {
    isPublic: false,
    allowCopy: true,
    allowDownload: true,
    allowComments: true,
  },
  onInviteUser,
  onRemoveCollaborator,
  onChangePermission,
  onSettingsChange,
  className,
}: ShareDrawerProps) => {
  const { t } = useTranslation();

  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<"read" | "write">(
    "read",
  );
  const [shareSettings, setShareSettings] =
    useState<ShareSettings>(initialSettings);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    initialCollaborators.length > 0
      ? initialCollaborators
      : [
          {
            id: "1",
            name: "Алексей Иванов",
            email: "alexey@example.com",
            permission: "admin",
            isOnline: true,
          },
          {
            id: "2",
            name: "Мария Петрова",
            email: "maria@example.com",
            permission: "write",
            isOnline: false,
            lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
          },
        ],
  );

  const copyShareUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      message.success(t("notes.share.linkCopied"));
    } catch (error) {
      message.error(t("notes.share.linkCopyFailed"));
    }
  }, [shareUrl, t]);

  const handleInviteUser = useCallback(() => {
    if (!inviteEmail) {
      message.error(t("notes.share.enterEmail"));
      return;
    }

    // Check if user already exists
    if (collaborators.some((user) => user.email === inviteEmail)) {
      message.error(t("notes.share.userAlreadyExists"));
      return;
    }

    if (onInviteUser) {
      onInviteUser(inviteEmail, invitePermission);
    } else {
      // Default action - add to local state
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        permission: invitePermission,
        isOnline: false,
      };

      setCollaborators((prev) => [...prev, newCollaborator]);
    }

    setInviteEmail("");
    message.success(t("notes.share.userInvited"));
  }, [inviteEmail, invitePermission, collaborators, onInviteUser, t]);

  const handlePermissionChange = useCallback(
    (userId: string, permission: "read" | "write" | "admin") => {
      if (onChangePermission) {
        onChangePermission(userId, permission);
      } else {
        // Default action - update local state
        setCollaborators((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, permission } : user,
          ),
        );
      }
      message.success(t("notes.share.permissionChanged"));
    },
    [onChangePermission, t],
  );

  const handleRemoveCollaborator = useCallback(
    (userId: string) => {
      if (onRemoveCollaborator) {
        onRemoveCollaborator(userId);
      } else {
        // Default action - remove from local state
        setCollaborators((prev) => prev.filter((user) => user.id !== userId));
      }
      message.success(t("notes.share.userRemoved"));
    },
    [onRemoveCollaborator, t],
  );

  const handleSettingsChange = useCallback(
    (key: keyof ShareSettings, value: boolean) => {
      const newSettings = { ...shareSettings, [key]: value };
      setShareSettings(newSettings);

      if (onSettingsChange) {
        onSettingsChange(newSettings);
      }
    },
    [shareSettings, onSettingsChange],
  );

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "admin":
        return "red";
      case "write":
        return "orange";
      case "read":
        return "blue";
      default:
        return "default";
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "admin":
        return <SettingOutlined />;
      case "write":
        return <EditOutlined />;
      case "read":
        return <EyeOutlined />;
      default:
        return null;
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Drawer
      title={
        <Space>
          <TeamOutlined />
          {t("notes.share.title")}
        </Space>
      }
      open={open}
      onClose={onClose}
      width={420}
      className={cn(styles.shareDrawer, className)}
    >
      <div className={cn(styles.shareContent)}>
        {/* Share Link Section */}
        <div className={cn(styles.shareSection)}>
          <Title level={5} className={cn(styles.sectionTitle)}>
            <LinkOutlined className={cn(styles.titleIcon)} />
            {t("notes.share.shareLink")}
          </Title>
          <Input.Group compact>
            <Input
              value={shareUrl}
              readOnly
              style={{ width: "calc(100% - 40px)" }}
              className={cn(styles.shareInput)}
            />
            <Tooltip title={t("notes.share.copyLink")}>
              <Button
                icon={<CopyOutlined />}
                onClick={copyShareUrl}
                className={cn(styles.copyButton)}
              />
            </Tooltip>
          </Input.Group>
          <Text type="secondary" className={cn(styles.helpText)}>
            {t("notes.share.shareLinkDescription")}
          </Text>
        </div>

        <Divider className={cn(styles.divider)} />

        {/* Invite User Section */}
        <div className={cn(styles.shareSection)}>
          <Title level={5} className={cn(styles.sectionTitle)}>
            <UserAddOutlined className={cn(styles.titleIcon)} />
            {t("notes.share.inviteUser")}
          </Title>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder={t("notes.share.emailPlaceholder")}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onPressEnter={handleInviteUser}
              status={inviteEmail && !isValidEmail(inviteEmail) ? "error" : ""}
              style={{ width: "55%" }}
              className={cn(styles.inviteInput)}
            />
            <Select
              value={invitePermission}
              onChange={setInvitePermission}
              style={{ width: "30%" }} // FIXME INLINES
              className={cn(styles.permissionSelect)}
            >
              <Option value="read">{t("notes.permissions.read")}</Option>
              <Option value="write">{t("notes.permissions.write")}</Option>
            </Select>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleInviteUser}
              disabled={!inviteEmail || !isValidEmail(inviteEmail)}
              style={{ width: "15%" }}
              className={cn(styles.inviteButton)}
            />
          </Space.Compact>
        </div>

        <Divider className={cn(styles.divider)} />

        {/* Access Settings Section */}
        <div className={cn(styles.shareSection)}>
          <Title level={5} className={cn(styles.sectionTitle)}>
            <SettingOutlined className={cn(styles.titleIcon)} />
            {t("notes.share.accessSettings")}
          </Title>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div className={cn(styles.settingItem)}>
              <div className={cn(styles.settingInfo)}>
                <Text className={cn(styles.settingTitle)}>
                  {t("notes.share.publicAccess")}
                </Text>
                <Text
                  type="secondary"
                  className={cn(styles.settingDescription)}
                >
                  {t("notes.share.publicAccessDescription")}
                </Text>
              </div>
              <Switch
                checked={shareSettings.isPublic}
                onChange={(checked) =>
                  handleSettingsChange("isPublic", checked)
                }
              />
            </div>

            <div className={cn(styles.settingItem)}>
              <div className={cn(styles.settingInfo)}>
                <Text className={cn(styles.settingTitle)}>
                  {t("notes.share.allowCopy")}
                </Text>
                <Text
                  type="secondary"
                  className={cn(styles.settingDescription)}
                >
                  {t("notes.share.allowCopyDescription")}
                </Text>
              </div>
              <Switch
                checked={shareSettings.allowCopy}
                onChange={(checked) =>
                  handleSettingsChange("allowCopy", checked)
                }
              />
            </div>

            <div className={cn(styles.settingItem)}>
              <div className={cn(styles.settingInfo)}>
                <Text className={cn(styles.settingTitle)}>
                  {t("notes.share.allowDownload")}
                </Text>
                <Text
                  type="secondary"
                  className={cn(styles.settingDescription)}
                >
                  {t("notes.share.allowDownloadDescription")}
                </Text>
              </div>
              <Switch
                checked={shareSettings.allowDownload}
                onChange={(checked) =>
                  handleSettingsChange("allowDownload", checked)
                }
              />
            </div>

            <div className={cn(styles.settingItem)}>
              <div className={cn(styles.settingInfo)}>
                <Text className={cn(styles.settingTitle)}>
                  {t("notes.share.allowComments")}
                </Text>
                <Text
                  type="secondary"
                  className={cn(styles.settingDescription)}
                >
                  {t("notes.share.allowCommentsDescription")}
                </Text>
              </div>
              <Switch
                checked={shareSettings.allowComments}
                onChange={(checked) =>
                  handleSettingsChange("allowComments", checked)
                }
              />
            </div>
          </Space>
        </div>

        <Divider className={cn(styles.divider)} />

        {/* Collaborators Section */}
        <div className={cn(styles.shareSection)}>
          <Title level={5} className={cn(styles.sectionTitle)}>
            <TeamOutlined className={cn(styles.titleIcon)} />
            {t("notes.share.collaborators")} ({collaborators.length})
          </Title>
          <List
            size="small"
            dataSource={collaborators}
            className={cn(styles.collaboratorsList)}
            renderItem={(collaborator) => (
              <List.Item
                className={cn(styles.collaboratorItem)}
                actions={[
                  <Select
                    size="small"
                    value={collaborator.permission}
                    onChange={(value) =>
                      handlePermissionChange(collaborator.id, value)
                    }
                    style={{ width: 110 }}
                    className={cn(styles.collaboratorPermissionSelect)}
                  >
                    <Option value="read">
                      <Space>
                        <EyeOutlined />
                        {t("notes.permissions.read")}
                      </Space>
                    </Option>
                    <Option value="write">
                      <Space>
                        <EditOutlined />
                        {t("notes.permissions.write")}
                      </Space>
                    </Option>
                    <Option value="admin">
                      <Space>
                        <SettingOutlined />
                        {t("notes.permissions.admin")}
                      </Space>
                    </Option>
                  </Select>,
                  collaborator.permission !== "admin" && (
                    <Button
                      size="small"
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className={cn(styles.removeButton)}
                      danger
                    />
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      dot
                      status={collaborator.isOnline ? "success" : "default"}
                      className={cn(styles.collaboratorBadge)}
                    >
                      <Avatar
                        size="small"
                        className={cn(styles.collaboratorAvatar)}
                      >
                        {collaborator.avatar || collaborator.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <div className={cn(styles.collaboratorHeader)}>
                      <span className={cn(styles.collaboratorName)}>
                        {collaborator.name}
                      </span>
                      <Tag
                        color={getPermissionColor(collaborator.permission)}
                        icon={getPermissionIcon(collaborator.permission)}
                        size="small"
                        className={cn(styles.permissionTag)}
                      >
                        {t(`notes.permissions.${collaborator.permission}`)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className={cn(styles.collaboratorMeta)}>
                      <Text
                        type="secondary"
                        className={cn(styles.collaboratorEmail)}
                      >
                        {collaborator.email}
                      </Text>
                      <Text
                        type="secondary"
                        className={cn(styles.collaboratorStatus)}
                      >
                        {collaborator.isOnline
                          ? t("notes.share.online")
                          : t("notes.share.lastSeen", {
                              time: collaborator.lastSeen?.toLocaleTimeString(),
                            })}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Drawer>
  );
};
