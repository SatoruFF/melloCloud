import { PieChartOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Card, Col, Row, Spin, Statistic, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import cn from 'classnames';
import _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { deleteAvatar, setAvatar } from '../../../entities/user/model/slice/userSlice';
import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import { useDeleteAvatarMutation } from '../../../shared/api/file';
import { Variables } from '../../../shared/api/localVariables';
import avatarIcon from '../../../shared/assets/avatar-icon.png';
import { sizeFormat } from '../../../shared/utils/sizeFormat';
import styles from '../styles/profile.module.scss';
import { Spinner } from '../../../shared';

const { Paragraph } = Typography;

const Profile = () => {
  const { t } = useTranslation();
  const user = useAppSelector(state => state.user);
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
    beforeUpload: file => {
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
      format: percent => percent && `${parseFloat(percent.toFixed(2))}%`,
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
                <Spinner />
              ) : (
                <Button type="primary" danger onClick={() => changeAvatarHandler()}>
                  {t('buttons.delete-avatar')}
                </Button>
              )}
              <Upload className={cn(styles.profileUploader)} name="file" multiple={false} maxCount={1} {...props}>
                <Button className={cn(styles.uploadBtn)}>{t('buttons.upload-avatar')}</Button>
              </Upload>
            </div>
          </div>
          <div className={cn(styles.profileRightSide)}>
            <div className={cn(styles.profileName)}>{user.userName}</div>
            <Paragraph copyable className={cn(styles.profileEmail)}>
              {t('auth.email')} : {user.email}
            </Paragraph>
            <Paragraph className={cn(styles.profileItem)}>
              {t('user.role')} : {user.role}
            </Paragraph>
            <Row gutter={16} className={cn(styles.profileStat)}>
              <Col span={12}>
                <Card>
                  <Statistic title={t('user.total-space')} value={totalSpace} />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title={t('user.used-space')}
                    value={usedSize}
                    precision={2}
                    prefix={<PieChartOutlined />}
                  />
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
