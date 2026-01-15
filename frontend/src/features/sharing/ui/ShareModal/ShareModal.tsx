import React, { useState } from "react";
import { Modal, Input, Select, Button, List, Avatar, Tag, message, Tooltip, Space, Divider } from "antd";
import { User, Link, Trash2, Copy, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import {
  useGetResourcePermissionsQuery,
  useShareResourceMutation,
  useRevokePermissionMutation,
  useUpdatePermissionMutation,
  useCreatePublicLinkMutation,
  useDeletePublicLinkMutation,
  ResourceType,
  PermissionLevel,
  type SharePermission,
} from "../../../../entities/sharing";
import styles from "./Share-modal.module.scss";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  resourceId: number;
  resourceName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, resourceType, resourceId, resourceName }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>(PermissionLevel.VIEWER);

  const { data: permissions, isLoading } = useGetResourcePermissionsQuery(
    { resourceType, resourceId },
    { skip: !open }
  );

  const [shareResource, { isLoading: isSharing }] = useShareResourceMutation();
  const [revokePermission] = useRevokePermissionMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const [createPublicLink, { isLoading: isCreatingLink }] = useCreatePublicLinkMutation();
  const [deletePublicLink] = useDeletePublicLinkMutation();

  const publicPermission = permissions?.find((p) => p.isPublic);

  const handleShare = async () => {
    if (!email.trim()) {
      message.error(t("sharing.messages.emailRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error(t("sharing.messages.invalidEmail"));
      return;
    }

    try {
      await shareResource({
        resourceType,
        resourceId,
        email: email.trim(),
        permissionLevel,
      }).unwrap();

      message.success(t("sharing.messages.shareSuccess", { email }));
      setEmail("");
    } catch (error: any) {
      message.error(error?.data?.message || t("sharing.messages.shareFailed"));
    }
  };

  const handleCreatePublicLink = async () => {
    try {
      const { url } = await createPublicLink({
        resourceType,
        resourceId,
        permissionLevel: PermissionLevel.VIEWER,
      }).unwrap();

      await navigator.clipboard.writeText(url);
      message.success(t("sharing.messages.publicLinkCreated"));
    } catch (error: any) {
      message.error(error?.data?.message || t("sharing.messages.publicLinkCreateFailed"));
    }
  };

  const handleDeletePublicLink = async () => {
    try {
      await deletePublicLink({ resourceType, resourceId }).unwrap();
      message.success(t("sharing.messages.publicLinkDeleted"));
    } catch (error: any) {
      message.error(error?.data?.message || t("sharing.messages.publicLinkDeleteFailed"));
    }
  };

  const handleCopyLink = async () => {
    if (publicPermission?.publicToken) {
      const url = `${window.location.origin}/shared/${publicPermission.publicToken}`;
      await navigator.clipboard.writeText(url);
      message.success(t("sharing.messages.linkCopied"));
    }
  };

  const handleRevokePermission = async (permissionId: number, userName?: string) => {
    try {
      await revokePermission(permissionId).unwrap();
      message.success(t("sharing.messages.accessRevoked", { userName: userName ? ` ${t("for")} ${userName}` : "" }));
    } catch (error: any) {
      message.error(error?.data?.message || t("sharing.messages.accessRevokeFailed"));
    }
  };

  const handleUpdatePermission = async (permissionId: number, level: PermissionLevel) => {
    try {
      await updatePermission({ permissionId, permissionLevel: level }).unwrap();
      message.success(t("sharing.messages.permissionUpdated"));
    } catch (error: any) {
      message.error(error?.data?.message || t("sharing.messages.permissionUpdateFailed"));
    }
  };

  return (
    <Modal
      title={
        <div className={cn(styles.modalTitle)}>
          <span>{t("sharing.modal.title", { resourceName })}</span>
          <Tag color="blue">{resourceType}</Tag>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className={cn(styles.shareModal)}
    >
      {/* Invite Section */}
      <div className={cn(styles.section)}>
        <h3>
          <User size={16} style={{ marginRight: 8 }} /> {t("sharing.modal.invitePeople")}
        </h3>
        <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
          <Input
            placeholder={t("sharing.modal.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefix={<User size={16} />}
            onPressEnter={handleShare}
            disabled={isSharing}
          />
          <Select style={{ width: 160 }} value={permissionLevel} onChange={setPermissionLevel}>
            <Select.Option key="viewer" value={PermissionLevel.VIEWER}>
              <Tooltip title={t("sharing.permissions.descriptions.viewer")}>{t("sharing.permissions.viewer")}</Tooltip>
            </Select.Option>
            <Select.Option key="commenter" value={PermissionLevel.COMMENTER}>
              <Tooltip title={t("sharing.permissions.descriptions.commenter")}>
                {t("sharing.permissions.commenter")}
              </Tooltip>
            </Select.Option>
            <Select.Option key="editor" value={PermissionLevel.EDITOR}>
              <Tooltip title={t("sharing.permissions.descriptions.editor")}>{t("sharing.permissions.editor")}</Tooltip>
            </Select.Option>
            <Select.Option key="admin" value={PermissionLevel.ADMIN}>
              <Tooltip title={t("sharing.permissions.descriptions.admin")}>{t("sharing.permissions.admin")}</Tooltip>
            </Select.Option>
          </Select>
          <Button type="primary" onClick={handleShare} loading={isSharing}>
            {t("sharing.modal.share")}
          </Button>
        </Space.Compact>
        <p className={cn(styles.hint)}>💡 {t("sharing.modal.hint")}</p>
      </div>

      <Divider />

      {/* Public Link Section */}
      <div className={cn(styles.section)}>
        <h3>
          <Link size={16} style={{ marginRight: 8 }} /> {t("sharing.modal.publicLinkSharing")}
        </h3>
        {publicPermission ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              value={`${window.location.origin}/shared/${publicPermission.publicToken}`}
              readOnly
              addonAfter={
                <Space>
                  <Tooltip title={t("sharing.modal.copyLink")}>
                    <Copy size={16} onClick={handleCopyLink} style={{ cursor: "pointer" }} />
                  </Tooltip>
                  <Tooltip title={t("sharing.modal.deleteLink")}>
                    <Trash2
                      size={16}
                      onClick={handleDeletePublicLink}
                      style={{ cursor: "pointer", color: "#ff4d4f" }}
                    />
                  </Tooltip>
                </Space>
              }
            />
            <Tag color="green" icon={<Link size={14} />}>
              {t("sharing.modal.publicLinkActive", { resourceType: resourceType.toLowerCase() })}
            </Tag>
          </Space>
        ) : (
          <>
            <Button icon={<Link size={16} />} onClick={handleCreatePublicLink} loading={isCreatingLink} block>
              {t("sharing.modal.createPublicLink")}
            </Button>
            <p className={cn(styles.hint)}>📎 {t("sharing.modal.publicLinkHint")}</p>
          </>
        )}
      </div>

      <Divider />

      {/* Permissions List */}
      <div className={cn(styles.section)}>
        <h3>{t("sharing.modal.peopleWithAccess", { count: permissions?.filter((p) => !p.isPublic).length || 0 })}</h3>
        <List
          loading={isLoading}
          dataSource={permissions?.filter((p) => !p.isPublic) || []}
          locale={{ emptyText: t("sharing.modal.noCollaborators") }}
          className={cn(styles.permissionsList)}
          renderItem={(permission: SharePermission) => (
            <List.Item
              key={permission.id}
              className={cn(styles.permissionItem)}
              actions={[
                permission.permissionLevel !== PermissionLevel.OWNER ? (
                  <Select
                    key={`select-${permission.id}`}
                    size="small"
                    value={permission.permissionLevel}
                    onChange={(level) => handleUpdatePermission(permission.id, level)}
                    style={{ width: 130 }}
                  >
                    <Select.Option key="viewer" value={PermissionLevel.VIEWER}>
                      {t("sharing.permissions.viewer")}
                    </Select.Option>
                    <Select.Option key="commenter" value={PermissionLevel.COMMENTER}>
                      {t("sharing.permissions.commenter")}
                    </Select.Option>
                    <Select.Option key="editor" value={PermissionLevel.EDITOR}>
                      {t("sharing.permissions.editor")}
                    </Select.Option>
                    <Select.Option key="admin" value={PermissionLevel.ADMIN}>
                      {t("sharing.permissions.admin")}
                    </Select.Option>
                  </Select>
                ) : (
                  <Tag key={`owner-${permission.id}`} color="gold">
                    {t("sharing.permissions.owner")}
                  </Tag>
                ),
                permission.permissionLevel !== PermissionLevel.OWNER && (
                  <Tooltip key={`tooltip-${permission.id}`} title={t("sharing.modal.removeAccess")}>
                    <Button
                      danger
                      size="small"
                      type="text"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleRevokePermission(permission.id, permission.user?.userName)}
                    />
                  </Tooltip>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  permission.user?.avatar ? (
                    <Avatar src={permission.user.avatar} />
                  ) : (
                    <Avatar icon={<User size={16} />} style={{ backgroundColor: "#1890ff" }} />
                  )
                }
                title={
                  <Space>
                    {permission.user?.userName || permission.email || t("sharing.modal.unknownUser")}
                    {permission.email && !permission.subjectId && (
                      <Tag color="orange">{t("sharing.modal.pending")}</Tag>
                    )}
                    {permission.expiresAt && (
                      <Tooltip
                        title={t("sharing.modal.expires", {
                          date: new Date(permission.expiresAt).toLocaleDateString(),
                        })}
                      >
                        <Tag icon={<Clock size={14} />} color="warning">
                          {t("sharing.modal.temporary")}
                        </Tag>
                      </Tooltip>
                    )}
                  </Space>
                }
                description={permission.user?.email || permission.email}
              />
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};
