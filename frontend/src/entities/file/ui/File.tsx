// react & core
import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// redux
import { unwrapResult } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "../../../app/store";

// antd
import { Button, Popconfirm, Tooltip, message } from "antd";

// external libs
import cn from "classnames";
import { get } from "lodash-es";
import { Link as LinkIcon, Share2, Download, Trash2, AlertCircle } from "lucide-react"; // ✅ Все иконки из Lucide

// features
import { FileViewer } from "../../../features/fileViewer";
import { ShareModal } from "../../../features/sharing";

// shared
import { sizeFormat } from "../../../shared";

// entities
import { ResourceType } from "../../../entities/sharing";

// internal (entity)
import { useDeleteFileMutation, useDownloadFileMutation } from "../model/api/fileApi";
import { pushToPath, pushToStack, setDir, setFiles } from "../model/slice/fileSlice";
import { getCurrentFileDirSelector, getCurrentFileViewSelector } from "../model/selectors/getFiles";
import type { FileProps } from "../types/file";

// styles
import styles from "./file.module.scss";

const File: React.FC<FileProps> = ({ file }) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Format file size
  const size = sizeFormat(file.size);

  // Redux
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector(getCurrentFileDirSelector);
  const fileView = useAppSelector(getCurrentFileViewSelector);

  // RTK Query
  const [downloadFile] = useDownloadFileMutation();
  const [deleteFile, { isLoading: rmLoading }] = useDeleteFileMutation();

  // Get file type
  const fileType = get(file, "type", "");
  const isFolder = fileType === "dir";

  // Определяем тип ресурса для sharing
  const resourceType = isFolder ? ResourceType.FOLDER : ResourceType.FILE;

  // Получаем isShared из файла
  const isShared = file.isShared || false;

  const openDirHandler = () => {
    if (isFolder) {
      dispatch(setDir(file.id));
      dispatch(pushToStack(currentDir));
      dispatch(pushToPath({ title: file.name }));
    }
  };

  const downloadHandler = async () => {
    try {
      const response: any = await downloadFile({ file });
      unwrapResult(response);
      messageApi.success(t("files.download-success"));
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || t("files.download-failed");
      messageApi.error(errorMsg);
    }
  };

  const deleteHandler = async () => {
    try {
      const response: any = await deleteFile({ file });
      unwrapResult(response);
      dispatch(setFiles(response.data));
      messageApi.success(t("files.deleted"));
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || t("files.delete-failed");
      messageApi.error(errorMsg);
    }
  };

  const shareHandler = () => {
    setShareModalOpen(true);
  };

  if (rmLoading) {
    messageApi.loading(t("notes.loading"));
  }

  // Plate View (Grid)
  if (fileView === "plate") {
    return (
      <>
        {contextHolder}
        <motion.div key={file.id} className={cn(styles.filePlateFileWrapper)} onDoubleClick={openDirHandler}>
          <div className={styles.fileIconWrapper}>
            <FileViewer type={fileType} url={file.url} />
            {isShared && (
              <div className={styles.sharedBadge}>
                <LinkIcon size={14} />
              </div>
            )}
          </div>

          <Tooltip title={file.name}>
            <div className={cn(styles.fileName)}>{file.name}</div>
          </Tooltip>

          <div className={cn(styles.fileBtns)}>
            <Button
              className={cn(styles.fileBtn, styles.fileShare)}
              onClick={shareHandler}
              type="link"
              icon={<Share2 size={16} />}
            >
              {isShared ? t("files.manage-share") : t("files.share")}
            </Button>

            {!isFolder && (
              <Button
                className={cn(styles.fileBtn, styles.fileDownload)}
                onClick={downloadHandler}
                type="link"
                icon={<Download size={16} />}
              >
                {t("files.download")}
              </Button>
            )}

            <Popconfirm
              title={t("files.delete")}
              description={t("files.confirm")}
              onConfirm={deleteHandler}
              okText={t("common.yes")}
              cancelText={t("common.no")}
              icon={<AlertCircle size={18} style={{ color: "red" }} />}
            >
              <Button className={cn(styles.fileBtn, styles.fileDelete)} type="link" danger icon={<Trash2 size={16} />}>
                {t("files.delete")}
              </Button>
            </Popconfirm>
          </div>
        </motion.div>

        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          resourceType={resourceType}
          resourceId={Number(file.id)}
          resourceName={file.name}
        />
      </>
    );
  }

  // List View
  return (
    <>
      {contextHolder}
      <motion.div key={file.id} className={cn(styles.fileWrapper)} onDoubleClick={openDirHandler}>
        <div className={styles.fileIconWrapper}>
          <FileViewer type={fileType} url={file.url} />
          {isShared && (
            <div className={styles.sharedBadgeList}>
              <LinkIcon size={12} />
            </div>
          )}
        </div>

        <Tooltip title={file.name}>
          <div className={cn(styles.fileName)}>{file.name}</div>
        </Tooltip>

        <div className={cn(styles.fileDate)}>
          {file.updatedAt ? file.updatedAt.slice(0, 10) : t("files.unknown-date")}
        </div>

        <div className={cn(styles.fileSize)}>{size}</div>

        <Button
          className={cn(styles.fileBtn, styles.fileShare)}
          onClick={shareHandler}
          icon={<Share2 size={16} />}
          ghost
        >
          {isShared ? t("files.manage-share") : t("files.share")}
        </Button>

        {!isFolder && (
          <Button
            className={cn(styles.fileBtn, styles.fileDownload)}
            onClick={downloadHandler}
            ghost
            icon={<Download size={16} />}
          >
            {t("files.download")}
          </Button>
        )}

        <Popconfirm
          title={t("files.delete")}
          description={t("files.confirm")}
          onConfirm={deleteHandler}
          okText={t("common.yes")}
          cancelText={t("common.no")}
          icon={<AlertCircle size={18} style={{ color: "red" }} />}
        >
          <Button className={cn(styles.fileBtn, styles.fileDelete)} type="link" danger icon={<Trash2 size={16} />}>
            {t("files.delete")}
          </Button>
        </Popconfirm>
      </motion.div>

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        resourceType={resourceType}
        resourceId={Number(file.id)}
        resourceName={file.name}
      />
    </>
  );
};

export default memo(File);
