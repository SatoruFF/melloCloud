import { useCallback, useEffect, useState } from 'react';
import { Button, Spin, Modal, Input, message, Select, Breadcrumb } from 'antd';
import { LeftOutlined, UploadOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { unwrapResult } from '@reduxjs/toolkit';
import { useAppSelector } from '../../../app/store/store';
import { useAppDispatch } from '../../../app/store/store';
import { useCreateDirMutation, useGetFilesQuery } from '../../../shared/api/file';
import Filelist from '../../../widgets/fileList/ui/Filelist';
import { setFiles, addNewFile, setDir, popToStack, setView, popToPath } from '../../../app/store/reducers/fileSlice';
import { generateParams } from '../../../shared/utils/generateParams';
import UploadModal from '../../../features/uploadModal/ui/UploadModal';

import diskBack from '../../../shared/assets/disk-back.jpg';
import styles from '../styles/fileSpace.module.scss';
import cn from 'classnames';
import { Search } from '../../../shared';

const FileSpace = () => {
  const { t } = useTranslation();
  //Redux state
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector(state => state.files.currentDir);
  const dirStack = useAppSelector(state => state.files.dirStack);
  const paths = useAppSelector(state => state.files.paths);

  //states
  const [modal, setModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [sort, setSort]: any = useState('');
  const [search, setSearch] = useState('');
  const onSearch = useCallback((value: string) => setSearch(value), []);

  //RTK query
  const params = generateParams(currentDir, sort, search);
  const { data, isLoading, refetch } = useGetFilesQuery(params ? params : null);
  const [addFile, { data: dirData, error: dirError }] = useCreateDirMutation();

  useEffect(() => {
    refetch();
  }, [sort]);

  useEffect(() => {
    if (data) {
      dispatch(setFiles(data));
    }
  }, [data, currentDir]);

  useEffect(() => {
    dispatch(setDir(currentDir));
  }, [currentDir]);

  useEffect(() => {
    if (dirData) {
      dispatch(addNewFile(dirData));
      refetch();
    }
    if (dirError) {
      message.error('Create dir error');
    }
  }, [dirData, dirError]);

  const goBack = () => {
    if (dirStack.length > 0) {
      dispatch(popToStack());
      dispatch(popToPath());
    }
  };

  // create new folder
  const addNewFolder = async () => {
    try {
      if (folderName.length === 0) {
        return message.info('The file name should not be empty');
      }
      const folderNameValid = folderName.replace(/[^\p{L}\d\s]/gu, '').trim();
      const response: any = await addFile({
        name: folderNameValid,
        type: 'dir',
        parent: currentDir,
      });
      unwrapResult(response);
      setModal(false);
      setFolderName('');
    } catch (e: any) {
      message.error(`Request failed: ${e.data.message}`);
    }
  };

  if (isLoading || !data) {
    return <Spin style={{ width: '100%', height: '100%', marginTop: '400px' }} />;
  }

  return (
    <div className={cn(styles.diskWrapper)}>
      <img src={diskBack} className={cn(styles.diskBackgroundImg)} loading="lazy" />
      <div className={cn(styles.diskNav)}>
        <div className={cn(styles.diskControlBtns)}>
          <Button onClick={() => goBack()}>
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
          <Search placeholder={t('files.search-placeholder')} onSearch={onSearch} />
          <div className={cn(styles.visual)}>
            <UnorderedListOutlined className={cn(styles.visualByList)} onClick={() => dispatch(setView('list'))} />
            <AppstoreOutlined className={cn(styles.visualByFile)} onClick={() => dispatch(setView('plate'))} />
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

export default FileSpace;
