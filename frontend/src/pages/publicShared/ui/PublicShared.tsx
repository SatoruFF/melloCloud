import React, { memo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Lock, Eye, Clock, HardDrive, Download } from "lucide-react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useAccessPublicResourceQuery, useDownloadPublicFileMutation, ResourceType } from "../../../entities/sharing";
import { AppSkeleton, sizeFormat, PrimaryButton } from "../../../shared";
import { FileViewer } from "../../../features/fileViewer";
import styles from "./public-shared.module.scss";

const PublicShared: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading, error } = useAccessPublicResourceQuery(token || "", {
    skip: !token,
  });

  const [downloadFile, { isLoading: isDownloading }] = useDownloadPublicFileMutation();

  useEffect(() => {
    if (!token) {
      navigate("/404");
    }
  }, [token, navigate]);

  const handleDownload = async () => {
    if (!token || !data?.resource) return;

    try {
      const blob = await downloadFile(token).unwrap();

      // Создаем URL для blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.resource.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      messageApi.success(t("sharing.publicLink.downloadSuccess"));
    } catch (error) {
      console.error("Download error:", error);
      messageApi.error(t("sharing.publicLink.downloadError"));
    }
  };

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
  const isFile = resource.resourceType === ResourceType.FILE;
  const fileType = resource.type || resource.mimeType || "";
  const formattedSize = resource.size ? sizeFormat(resource.size) : null;

  return (
    <>
      {contextHolder}
      <div className={cn(styles.publicShared, "animate__animated animate__fadeIn")}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>{t("sharing.publicLink.sharedContent")}</h1>
          </div>
          <div className={styles.headerRight}>
            {isFile && (
              <PrimaryButton
                onClick={handleDownload}
                loading={isDownloading}
                disabled={isDownloading}
                theme="success"
                size="medium"
                icon={<Download size={18} />}
                className={styles.downloadButton}
              >
                {t("sharing.publicLink.download")}
              </PrimaryButton>
            )}
            <div className={styles.permissionBadge}>
              <Eye size={16} />
              <span>{permissionLevel}</span>
            </div>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Preview Section (Left side) */}
          {isFile && (
            <div className={styles.previewSection}>
              <div className={styles.previewContainer}>
                <FileViewer type={fileType} url={resource.url} fileName={resource.name} />
              </div>
              <div className={styles.previewFooter}>
                <h3 className={styles.previewFileName}>
                  {resource.title || resource.name || t("sharing.publicLink.untitled")}
                </h3>
                {formattedSize && <span className={styles.previewFileSize}>{formattedSize}</span>}
              </div>
            </div>
          )}

          {/* Info Section (Right sidebar) */}
          <div className={cn(styles.infoSection, { [styles.fullWidth]: !isFile })}>
            {/* Resource Icon & Info */}
            <div className={styles.resourceHeader}>
              <div className={styles.iconWrapper}>
                <FileViewer type={fileType} url={resource.url} fileName={resource.name} />
              </div>
              <h2 className={styles.resourceTitle}>
                {resource.title || resource.name || t("sharing.publicLink.untitled")}
              </h2>
              {resource.description && <p className={styles.resourceDescription}>{resource.description}</p>}
            </div>

            {/* Content */}
            {resource.content && (
              <div className={styles.contentSection}>
                <div className={styles.contentHeader}>
                  <Eye size={18} />
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
                    <strong>{t("files.size")}:</strong> {formattedSize}
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
      </div>
    </>
  );
};

export default memo(PublicShared);
