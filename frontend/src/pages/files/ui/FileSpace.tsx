import { memo } from 'react';
import { AppstoreOutlined, LeftOutlined, UnorderedListOutlined, UploadOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Input, Modal, Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import UploadModal from '../../../features/uploadModal/ui/UploadModal';
import Filelist from '../../../widgets/fileList/ui/Filelist';
import { Search, Spinner } from '../../../shared';
import diskBack from '../../../shared/assets/disk-back.jpg';
import styles from './fileSpace.module.scss';
import { useFiles } from '../lib/hooks/useFiles';

const FileSpace = () => {
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
  } = useFiles();

  if (isLoading || !data) {
    return <Spinner fullscreen />;
  }

  return (
    <div className={cn(styles.diskWrapper)}>
      <img src={diskBack} className={cn(styles.diskBackgroundImg)} loading="lazy" />
      <div className={cn(styles.diskNav)}>
        <div className={cn(styles.diskControlBtns)}>
          <Button onClick={goBack}>
            <LeftOutlined />
          </Button>
          <Button onClick={() => setModal(true)}>
            <p className={cn(styles.diskCreateFolderTxt)}>{t('files.create-new-folder')}</p>
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setUploadModal(true)}
            className={cn(styles.uploadBtn, styles.diskUpload)}
          >
            {t('files.upload-file')}
          </Button>
          <UploadModal status={uploadModal} def={setUploadModal} />
          <Select
            className={cn(styles.diskOrder)}
            defaultValue={t('files.order-by')}
            onChange={value => setSort(value)}
            options={[
              { value: 'name', label: t('files.order.name') },
              { value: 'type', label: t('files.order.type') },
              { value: 'date', label: t('files.order.date') },
            ]}
          />
          <Search placeholder={t('files.search-placeholder')} className={cn(styles.searchFiles)} onSearch={onSearch} />
          <div className={cn(styles.visual)}>
            <UnorderedListOutlined className={cn(styles.visualByList)} />
            <AppstoreOutlined className={cn(styles.visualByFile)} />
          </div>
          <Breadcrumb separator=">" className={cn(styles.breadcrumb)} items={paths} />
        </div>
      </div>
      <Modal
        title={t('files.create-new-folder')}
        open={modal}
        onCancel={() => setModal(false)}
        footer={[
          <Button type="primary" onClick={addNewFolder}>
            {t('buttons.create-folder')}
          </Button>,
        ]}
      >
        <Input
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder={t('files.enter-folder-name')}
        />
      </Modal>
      <Filelist />
    </div>
  );
};

export default memo(FileSpace);
