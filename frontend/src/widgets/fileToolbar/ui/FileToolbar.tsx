import { AppstoreOutlined, LeftOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Input, Modal, Select } from "antd";
import cn from "classnames";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import UploadModal from "../../../features/uploadModal/ui/UploadModal";
import { Search, Spinner } from "../../../shared";
import { useFiles } from "../../../pages/files/lib/hooks/useFiles";
import styles from "./file-toolbar.module.scss";

export const FileToolbar = memo(() => {
  const { t } = useTranslation();
  const {
    modal,
    uploadModal,
    folderName,
    setModal,
    setUploadModal,
    setFolderName,
    setSort,
    onSearch,
    goBack,
    addNewFolder,
    data,
    isLoading,
    paths,
    setFileView,
  } = useFiles();

  if (isLoading || !data) {
    return <Spinner fullscreen />;
  }

  return (
    <>
      <div className={cn(styles.diskWrapper)}>
        <div className={cn(styles.diskControlBtns)}>
          <Button onClick={goBack}>
            <LeftOutlined />
          </Button>
          <Button onClick={() => setModal(true)}>
            <p className={cn(styles.diskCreateFolderTxt)}>{t("files.create-new-folder")}</p>
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setUploadModal(true)}
            className={cn(styles.uploadBtn, styles.diskUpload)}
          >
            {t("files.upload-file")}
          </Button>
          <UploadModal status={uploadModal} def={setUploadModal} />
          <Select
            className={cn(styles.diskOrder)}
            defaultValue={t("files.order-by")}
            onChange={(value) => setSort(value)}
            options={[
              { value: "name", label: t("files.order.name") },
              { value: "type", label: t("files.order.type") },
              { value: "date", label: t("files.order.date") },
            ]}
          />
          <Search placeholder={t("files.search-placeholder")} className={cn(styles.searchFiles)} onSearch={onSearch} />
          <div className={cn(styles.visual)}>
            <UnorderedListOutlined onClick={() => setFileView("list")} className={cn(styles.visualByList)} />
            <AppstoreOutlined onClick={() => setFileView("plate")} className={cn(styles.visualByFile)} />
          </div>
          <Breadcrumb separator=">" className={cn(styles.breadcrumb)} items={paths} />
        </div>
        <Modal
          title={t("files.create-new-folder")}
          open={modal}
          onCancel={() => setModal(false)}
          footer={[
            <Button type="primary" onClick={addNewFolder}>
              {t("buttons.create-folder")}
            </Button>,
          ]}
        >
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={t("files.enter-folder-name")}
          />
        </Modal>
      </div>
    </>
  );
});
