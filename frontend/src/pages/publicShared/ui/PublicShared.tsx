import React, { memo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Empty } from "antd";
import {
  File as FileIcon,
  Folder,
  FileText,
  CheckSquare,
  Calendar,
  MessageSquare,
  Lock,
  Eye,
  Clock,
  HardDrive,
} from "lucide-react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useAccessPublicResourceQuery, ResourceType } from "../../../entities/sharing";
import { AppSkeleton } from "../../../shared";
import styles from "./public-shared.module.scss";

const resourceIcons: Record<ResourceType, React.ReactNode> = {
  [ResourceType.FILE]: <FileIcon size={48} strokeWidth={1.5} />,
  [ResourceType.FOLDER]: <Folder size={48} strokeWidth={1.5} />,
  [ResourceType.NOTE]: <FileText size={48} strokeWidth={1.5} />,
  [ResourceType.TASK]: <CheckSquare size={48} strokeWidth={1.5} />,
  [ResourceType.EVENT]: <Calendar size={48} strokeWidth={1.5} />,
  [ResourceType.CHAT]: <MessageSquare size={48} strokeWidth={1.5} />,
  [ResourceType.COLUMN]: <CheckSquare size={48} strokeWidth={1.5} />,
  [ResourceType.KANBAN_BOARD]: <CheckSquare size={48} strokeWidth={1.5} />,
};

const PublicShared: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useAccessPublicResourceQuery(token || "", {
    skip: !token,
  });

  useEffect(() => {
    if (!token) {
      navigate("/404");
    }
  }, [token, navigate]);

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (error || !data) {
    return (
      <div className={cn(styles.errorContainer, "animate__animated animate__fadeIn")}>
        <div className={styles.errorCard}>
          <Lock className={styles.errorIcon} size={64} strokeWidth={1.5} />
          <h2 className={styles.errorTitle}>{t("sharing.publicLink.error.title")}</h2>
          <p className={styles.errorDescription}>{t("sharing.publicLink.error.description")}</p>
        </div>
      </div>
    );
  }

  const { resource, permissionLevel } = data;

  return (
    <div className={cn(styles.publicShared, "animate__animated animate__fadeIn")}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>{t("sharing.publicLink.sharedContent")}</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.permissionBadge}>
            <Eye size={16} />
            <span>{permissionLevel}</span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={styles.contentCard}>
        {/* Resource Icon & Info */}
        <div className={styles.resourceHeader}>
          <div className={styles.iconWrapper}>{resourceIcons[resource.resourceType || ResourceType.FILE]}</div>
          <h2 className={styles.resourceTitle}>
            {resource.title || resource.name || t("sharing.publicLink.untitled")}
          </h2>
          {resource.description && <p className={styles.resourceDescription}>{resource.description}</p>}
        </div>

        {/* Content */}
        {resource.content && (
          <div className={styles.contentSection}>
            <div className={styles.contentHeader}>
              <FileText size={18} />
              <span>{t("sharing.publicLink.content")}</span>
            </div>
            <div className={styles.contentText}>{resource.content}</div>
          </div>
        )}

        {/* Metadata */}
        <div className={styles.metadata}>
          {resource.size && (
            <div className={styles.metadataItem}>
              <HardDrive size={18} />
              <span>
                <strong>{t("files.size")}:</strong> {(resource.size / 1024).toFixed(2)} KB
              </span>
            </div>
          )}
          {resource.createdAt && (
            <div className={styles.metadataItem}>
              <Clock size={18} />
              <span>
                <strong>{t("common.created")}:</strong> {new Date(resource.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Read-only Notice */}
        <div className={styles.readOnlyNotice}>
          <Lock size={18} />
          <div>
            <strong>{t("sharing.publicLink.readOnly")}</strong>
            <p>{t("sharing.publicLink.readOnlyDescription")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PublicShared);
