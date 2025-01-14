import _ from 'lodash-es';
import { Button, Upload, message, Typography, Col, Row, Statistic, Card, Spin } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { unwrapResult } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import { useDeleteAvatarMutation } from '../../../shared/api/file';
import { setAvatar, deleteAvatar } from '../../../app/store/reducers/userSlice';
import { sizeFormat } from '../../../shared/utils/sizeFormat';
import { Variables } from '../../../shared/api/localVariables';

import avatarIcon from '../assets/avatar-icon.png';

import styles from '../style/profile.module.scss';
import cn from 'classnames';

const { Paragraph } = Typography;

const Profile = () => {
  const user = useAppSelector((state) => state.users.currentUser);
  const totalSpace = sizeFormat(user.diskSpace);
  const usedSize = sizeFormat(user.usedSpace);
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');
  const avatar = user.avatar ? user.avatar : avatarIcon;
  const [removeAvatar, { isLoading: rmAvatarLoad }] = useDeleteAvatarMutation();

  // file upload
  const props: UploadProps = {
    name: 'file',
    action: Variables.UpAvatar_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    beforeUpload: (file) => {
      const isPNG = file.type === 'image/png';
      const isJPEG = file.type === 'image/jpeg';
      if (!isPNG && !isJPEG) {
        message.error(`${file.name} is not a png or jpeg file`);
      }
      return isPNG || isJPEG ? true : Upload.LIST_IGNORE;
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        dispatch(setAvatar(info.file.response));
        message.success(`${info.file.name} file uploaded successfully`);
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

  const changeAvatarHandler = async () => {
    try {
      if (_.isEmpty(user.avatar)) {
        return message.error('Avatar not found');
      }
      const response: any = await removeAvatar();
      unwrapResult(response);
      dispatch(deleteAvatar());
      message.success('Avatar successfully deleted');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={cn(styles.profileWrapper)}>
      <div className={cn(styles.profileContent)}>
        <div className={cn(styles.profileMainCard)}>
          <div className={cn(styles.profileLeftSide)}>
            <img src={avatar} alt="avatar" loading="lazy" />
            <div className={cn(styles.profileBtns)}>
              {rmAvatarLoad ? (
                <Spin style={{ marginRight: '35px' }} />
              ) : (
                <Button type="primary" danger onClick={() => changeAvatarHandler()}>
                  Delete avatar
                </Button>
              )}
              <Upload className={cn(styles.profileUploader)} name="file" multiple={false} maxCount={1} {...props}>
                <Button className={cn(styles.uploadBtn)}>Upload avatar</Button>
              </Upload>
            </div>
          </div>
          <div className={cn(styles.profileRightSide)}>
            <div className={cn(styles.profileName)}>{user.userName}</div>
            <Paragraph copyable className={cn(styles.profileEmail)}>
              Email: {user.email}
            </Paragraph>
            <Paragraph className={cn(styles.profileItem)}>Role: {user.role}</Paragraph>
            <Row gutter={16} className={cn(styles.profileStat)}>
              <Col span={12}>
                <Card>
                  <Statistic title="Total space" value={totalSpace} />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic title="Used space" value={usedSize} precision={2} prefix={<PieChartOutlined />} />
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
