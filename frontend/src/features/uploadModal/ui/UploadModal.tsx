// @ts-nocheck
import { Upload as UploadIcon } from "lucide-react";
import { Button, Modal, Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";

import { useAppSelector } from "../../../app/store/store";
import { useAppDispatch } from "../../../app/store/store";
import { addNewFile, setFiles } from "../../../entities/file/model/slice/fileSlice";
import { getFilesSelector } from "../../../entities/file/model/selectors/getFiles";
import { useDeleteFileMutation } from "../../../entities/file/model/api/fileApi";
import { Variables } from "../../../shared/consts/localVariables";

import cn from "classnames";
import styles from "../styles/uploadModal.module.scss";

const { Dragger } = Upload;

interface UploadModalProps {
  status: boolean;
  def: (open: boolean) => void;
}

const UploadModal = ({ status, def }: UploadModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const currentFiles = useAppSelector(getFilesSelector);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [deleteFile] = useDeleteFileMutation();

  const handleClose = useCallback(() => {
    setFileList([]);
    def(false);
  }, [def]);

  const handleRemove = useCallback(
    async (file: UploadFile) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
      if (file.status === "done" && file.response?.id) {
        try {
          await deleteFile({ file: file.response }).unwrap();
          dispatch(setFiles(currentFiles.filter((f: { id: number }) => f.id !== file.response.id)));
          message.success(t("files.file-removed"));
        } catch {
          message.error(t("files.file-remove-failed"));
        }
      }
    },
    [currentFiles, deleteFile, dispatch, t]
  );

  const props: UploadProps = {
    name: "file",
    action: Variables.File_Upload,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      parent: currentDir,
    },
    fileList,
    multiple: true,
    maxCount: 10,
    showUploadList: {
      showRemoveIcon: true,
      showPreviewIcon: false,
    },
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === "done") {
        message.success(t("files.upload-success", { name: info.file.name }));
        dispatch(addNewFile(info.file.response));
      } else if (info.file.status === "error") {
        message.error(t("files.upload-failed", { name: info.file.name }));
      }
    },
    onRemove: handleRemove,
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${Number.parseFloat(percent.toFixed(2))}%`,
    },
  };

  return (
    <Modal
      open={status}
      title={t("files.upload-files-title")}
      className={cn(styles.uplModalFileSpace)}
      onCancel={handleClose}
      footer={[
        <Button key="back" type="primary" onClick={handleClose}>
          {t("buttons.return")}
        </Button>,
      ]}
    >
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <UploadIcon size={48} />
        </p>
        <p className="ant-upload-text">{t("files.upload-files-text")}</p>
        <p className="ant-upload-hint">{t("files.upload-files-hint")}</p>
      </Dragger>
    </Modal>
  );
};

export default UploadModal;
