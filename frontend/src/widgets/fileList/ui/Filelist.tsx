import React from "react";
import { Empty, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import File from "../../../entities/file/ui/File";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { IFile } from "../../../entities/file";
import {
  getCurrentFileDirSelector,
  getFilesHasMoreSelector,
  getFilesLimitSelector,
  getFilesLoadingSelector,
  getFilesOffsetSelector,
  getFilesSelector,
  getFilesViewSelector,
} from "../../../entities/file/model/selectors/getFiles";
import { addNewFile, setOffset } from "../../../entities/file/model/slice/fileSlice";
import { Variables } from "../../../shared/consts/localVariables";
import { AppSkeleton, ObservablePage } from "../../../shared";
import styles from "./fileList.module.scss";

const Filelist: React.FC = () => {
  const { t } = useTranslation();
  const files = useAppSelector(getFilesSelector);
  const fileView = useAppSelector(getFilesViewSelector);
  const limit = useAppSelector(getFilesLimitSelector);
  const offset = useAppSelector(getFilesOffsetSelector);
  const filesLoading = useAppSelector(getFilesLoadingSelector);
  const hasMoreFiles = useAppSelector(getFilesHasMoreSelector);
  const currentDir = useAppSelector(getCurrentFileDirSelector);

  const dispatch = useAppDispatch();
  const isFetchingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const uploadFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const token = localStorage.getItem("token");
      if (!token) {
        message.error(t("files.upload-unauthorized"));
        return;
      }
      let successCount = 0;
      let failCount = 0;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file?.name) continue;
        const formData = new FormData();
        formData.append("file", file);
        if (currentDir != null) formData.append("parent", String(currentDir));
        try {
          const res = await fetch(Variables.File_Upload, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const data = await res.json();
          if (res.ok && data?.id) {
            dispatch(addNewFile(data));
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }
      if (successCount > 0) {
        if (successCount === 1) message.success(t("files.upload-success", { name: fileList[0]?.name ?? "" }));
        else message.success(t("files.upload-success-many", { count: successCount }));
      }
      if (failCount > 0) {
        if (failCount === 1) message.error(t("files.upload-failed", { name: fileList[0]?.name ?? "" }));
        else message.error(t("files.upload-failed-many", { count: failCount }));
      }
    },
    [currentDir, dispatch, t]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles?.length) uploadFiles(droppedFiles);
    },
    [uploadFiles]
  );

  const onLoadNextPart = useCallback(() => {
    // debugger
    if (isFetchingRef.current || filesLoading) return;

    isFetchingRef.current = true;

    // !!! FIXME
    if (hasMoreFiles) {
      dispatch(setOffset(offset + 50));
    }
  }, [limit, filesLoading]);

  useEffect(() => {
    isFetchingRef.current = false;
  }, [offset]);

  const dropZoneContent = (
    <>
      {isDragging && (
        <div
          className={cn(styles.dropOverlay)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className={cn(styles.dropOverlayText)}>{t("files.upload-files-text")}</span>
        </div>
      )}
      {files.length === 0 ? (
        <div className={cn(styles.filesNotFound, "animate__animated animate__fadeIn")}>
          <Empty description={false} className="emptyFolder" />
        </div>
      ) : filesLoading ? (
        <AppSkeleton />
      ) : fileView === "plate" ? (
        <ObservablePage className={styles.observablePage} onScrollEnd={onLoadNextPart}>
          <div className={cn(styles.filePlateListWrapper, "animate__animated animate__fadeIn")}>
            {files.map((file: IFile) => (
              <File key={file.id} file={file} />
            ))}
          </div>
        </ObservablePage>
      ) : (
        <ObservablePage className={styles.observablePage} onScrollEnd={onLoadNextPart}>
          <div className={cn(styles.filelistWrapper, "animate__animated animate__fadeIn")}>
            <div className={cn(styles.fileListHeader)}>
              <p className={cn(styles.name)}>Name</p>
              <p className={cn(styles.date)}>Date</p>
              <p className={cn(styles.size)}>Size</p>
            </div>
            {files.map((file: IFile) => (
              <File key={file.id} file={file} />
            ))}
          </div>
        </ObservablePage>
      )}
    </>
  );

  return (
    <div
      className={cn(styles.fileListDropZone)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dropZoneContent}
    </div>
  );
};

// TODO: add sceletons on load

export default memo(Filelist);
