import { Button, Modal, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { useAppSelector } from '../../store/store';
import { useAppDispatch } from '../../store/store';
import { addNewFile } from '../../store/reducers/fileSlice';
import { Variables } from '../../config/localVariables';

import styles from '../../style/uploadModal.module.scss';
import cn from 'classnames';

const { Dragger } = Upload;

const UploadModal = ({ status, def }) => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');
  const currentDir = useAppSelector((state) => state.files.currentDir);

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
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  return (
    <Modal
      open={status}
      title="Upload files"
      className={cn(styles.uplModalFileSpace)}
      onCancel={() => def(false)}
      footer={[
        <Button key="back" type="primary" onClick={() => def(false)}>
          Return
        </Button>,
      ]}
    >
      <Dragger {...props} multiple={true} maxCount={5}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          You can upload up to 5 files at the same time. Downloading illegal content is prohibited
        </p>
      </Dragger>
    </Modal>
  );
};

export default UploadModal;
