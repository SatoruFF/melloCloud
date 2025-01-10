import { ApiOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, Divider, notification } from 'antd';

import { useAppSelector, useAppDispatch } from '../store/store';
import { sizeFormat } from '../utils/sizeFormat';
import { logout } from '../store/reducers/userSlice';
import { WELCOME_ROUTE } from '../utils/consts';
import InfoModal from './modals/InfoModal';
import PasswordModal from './modals/PasswordModal';
import DeleteModal from './modals/DeleteModal';

import styles from '../style/accountSettings.module.scss';
import cn from 'classnames';

const AccountSettings = () => {
  const [changeInfoModal, setChangeInfoModal] = useState(false);
  const [changePassModal, setChangePassModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const user = useAppSelector((state) => state.users.currentUser);
  const totalSpace = sizeFormat(user.diskSpace);
  const usedSize = sizeFormat(user.usedSpace);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logOut = () => {
    dispatch(logout());
    navigate(WELCOME_ROUTE);
    notification.open({
      message: 'You succesfully log out',
      description: 'You have successfully logged out of your account',
      placement: 'topLeft',
      icon: <ApiOutlined style={{ color: '#ff7875' }} />,
    });
  };

  return (
    <div className={cn(styles.accountWrapper)}>
      <div className={cn(styles.accountPersonal)}>
        <p className={cn(styles.personalItem)}>Username: {user.userName}</p>
        <p className={cn(styles.personalItem)}>Email: {user.email}</p>
        <p className={cn(styles.personalItem)}>Role: {user.role}</p>
        <Button className={cn(styles.personalLogout)} type="primary" onClick={() => logOut()}>
          Log out
        </Button>
      </div>
      <div className={cn(styles.accountSettings)}>
        <Divider orientation="left">Edit</Divider>
        <Button className={cn(styles.accountBtn)} onClick={() => setChangeInfoModal(true)}>
          Change profile info
        </Button>
      </div>
      <InfoModal status={changeInfoModal} def={setChangeInfoModal} />
      <PasswordModal status={changePassModal} def={setChangePassModal} />
      <DeleteModal status={deleteModal} def={setDeleteModal} />
    </div>
  );
};

export default AccountSettings;
