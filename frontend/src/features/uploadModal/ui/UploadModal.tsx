import { InboxOutlined } from '@ant-design/icons';
import { Button, Modal, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { addNewFile } from '../../../app/store/reducers/fileSlice';
import { useAppSelector } from '../../../app/store/store';
import { useAppDispatch } from '../../../app/store/store';
import { Variables } from '../../../shared/api/localVariables';

import cn from 'classnames';
import styles from '../styles/uploadModal.module.scss';

const { Dragger } = Upload;

const UploadModal = ({ status, def }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');
  const currentDir = useAppSelector(state => state.files.currentDir);

  // file upload
  const props: UploadProps = {
    name: 'file',
    action: Variables.FileUpload_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      parent: currentDir,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        dispatch(addNewFile(info.file.response));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed. Perhabs file already exist.`);
      }
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: percent => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  return (
    <Modal
      open={status}
      title={t('files.upload-files-title')}
      className={cn(styles.uplModalFileSpace)}
      onCancel={() => def(false)}
      footer={[
        <Button key="back" type="primary" onClick={() => def(false)}>
          {t('buttons.return')}
        </Button>,
      ]}
    >
      <Dragger {...props} multiple={true} maxCount={5}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('files.upload-files-text')}</p>
        <p className="ant-upload-hint"> {t('files.upload-files-hint')}</p>
      </Dragger>
    </Modal>
  );
};

export default UploadModal;
