import _ from 'lodash-es';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip, message } from 'antd';
import { motion } from 'framer-motion';
import { unwrapResult } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '../../../store/store';
import { pushToPath, pushToStack, setDir, setFiles } from '../../../store/reducers/fileSlice';
import { useDeleteFileMutation, useDownloadFileMutation, useGetFilesQuery } from '../../../TEMP/services/file';
import { sizeFormat } from '../../../utils/sizeFormat';
import FileViewer from '../../../features/fileViewer/ui/FileViewer';

import styles from '../style/file.module.scss';
import cn from 'classnames';

const File = ({ file }: any) => {
  //size format
  const size = sizeFormat(file.size);

  //redux
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const fileView = useAppSelector((state) => state.files.view);

  //rtk-query
  const [downloadFile] = useDownloadFileMutation();
  const [deleteFile, { isLoading: rmLoading }] = useDeleteFileMutation();

  //Check is image url
  const fileType = _.get(file, 'type', '');

  const openDirHandler = () => {
    if (file.type == 'dir') {
      dispatch(setDir(file.id));
      dispatch(pushToStack(currentDir));
      dispatch(pushToPath({ title: file.name }));
    }
  };

  const downloadHandler = async () => {
    try {
      const response: any = await downloadFile({
        file,
      });
      unwrapResult(response);
    } catch (error: any) {
      console.log(error);
      message.error(`Request failed with error: ${error.message}`);
    }
  };

  const deleteHandler = async () => {
    try {
      const response: any = await deleteFile({
        file,
      });
      unwrapResult(response);
      dispatch(setFiles(response.data));
      message.info('File was destroyed');
    } catch (error: any) {
      message.error(`Request failed: ${error.data.message}`);
    }
  };

  if (rmLoading) {
    message.info('loading...');
  }

  if (fileView == 'plate') {
    return (
      <motion.div
        key={Math.random()}
        className={cn(styles.fileplateFileWrapper)}
        onDoubleClick={() => openDirHandler()}
      >
        <FileViewer type={fileType} url={file.url} />

        <Tooltip title={file.name}>
          <div className={cn(styles.fileName)}>{file.name}</div>
        </Tooltip>
        <div className={cn(styles.fileBtns)}>
          {file.type !== 'dir' && (
            <Button className={cn(styles.fileBtn, styles.fileDownload)} onClick={() => downloadHandler()} type="link">
              Download
            </Button>
          )}
          <Popconfirm
            title="Delete"
            description="Exactly?"
            onConfirm={deleteHandler}
            okText="Yes"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
            <Button className={cn(styles.fileBtn, styles.fileDelete)} type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key={Math.random()} className={cn(styles.fileWrapper)} onDoubleClick={() => openDirHandler()}>
      <FileViewer type={fileType} url={file.url} />

      <Tooltip title={file.name}>
        <div className={cn(styles.fileName)}>{file.name}</div>
      </Tooltip>
      <div className={cn(styles.fileDate)}>{file.updatedAt ? file.updatedAt.slice(0, 10) : 'unknown'}</div>
      <div className={cn(styles.fileSize)}>{size}</div>
      {file.type !== 'dir' && (
        <Button className={cn(styles.fileBtn, styles.fileDownload)} onClick={() => downloadHandler()} ghost>
          Download
        </Button>
      )}
      <Popconfirm
        title="Delete"
        description="Exactly?"
        onConfirm={deleteHandler}
        okText="Yes"
        cancelText="No"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
      >
        <Button className={cn(styles.fileBtn, styles.fileDelete)} type="link" danger>
          Delete
        </Button>
      </Popconfirm>
    </motion.div>
  );
};

export default File;
