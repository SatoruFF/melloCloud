import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, notification, Drawer, Divider, Tooltip } from 'antd';
import { ApiOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import {
  FILE_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
  WELCOME_ROUTE,
} from '../../../shared/consts/consts';
import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import { logout } from '../../../app/store/reducers/userSlice';
import AccountSettings from '../../accountSettings/ui/AccountSettings.';
import avatarIcon from '../../../shared/assets/avatar-icon.png';
import WorkspacesDropdown from '../../../features/workspaceDropdown/ui/WorkspacesDropdown';

import mainLogo from '../../../shared/assets/mainLog.png';
import styles from '../styles/navbar.module.scss';
import LanguageSwitcher from '../../languageSwitcher/ui/LanguageSwitcher';

const MyNavbar: React.FC = () => {
  const { t } = useTranslation();
  const isAuth = useAppSelector((state) => state.users.isAuth);
  const user = useAppSelector((state) => state.users.currentUser);
  const [profile, setProfile] = useState(false);
  const [burger, setBurger] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const avatar = user.avatar ? user.avatar : avatarIcon;
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

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
    <div className={cn(styles.navbar)}>
      <div className={cn(styles.baseItems)}>
        <LanguageSwitcher />
        <div className={cn(styles.mainLogo)}>
          <img src={mainLogo} alt="" onClick={() => navigate(WELCOME_ROUTE)} />
        </div>
      </div>

      {isAuth ? (
        <div className={cn(styles.navItems)}>
          {!isTabletOrMobile && (
            <React.Fragment>
              <div className={cn(styles.navFiles)}>
                <Button ghost>
                  <NavLink to={FILE_ROUTE}>My files</NavLink>
                </Button>
              </div>
              <Button className={cn(styles.mainLogout)} type="primary" onClick={() => logOut()}>
                Log out
              </Button>
            </React.Fragment>
          )}

          <WorkspacesDropdown setProfile={setProfile} logOut={logOut} viewAll={isTabletOrMobile ? true : false} />

          <div className={cn(styles.navUser)}>
            {!isTabletOrMobile && (
              <Tooltip title="Account Settings">
                <div className={cn(styles.userInfo)} onClick={() => setProfile(true)}>
                  <p>{user.userName}</p>
                  <SettingOutlined />
                </div>
              </Tooltip>
            )}
            <div className={cn(styles.avatar)}>
              <img src={avatar} onClick={() => navigate(PROFILE_ROUTE)} />
            </div>
          </div>
          <Drawer
            title="Settings"
            placement="right"
            onClose={() => setProfile(false)}
            open={profile}
            style={{ backgroundColor: 'white' }}
          >
            <AccountSettings />
          </Drawer>
        </div>
      ) : (
        <div className={cn(styles.navItems)}>
          <div className={cn(styles.navItem)}>
            <Button ghost>
              <NavLink to={LOGIN_ROUTE}>authorization</NavLink>
            </Button>
          </div>
          <div className={cn(styles.navItem)}>
            <Button ghost>
              <NavLink to={REGISTRATION_ROUTE}>registration</NavLink>
            </Button>
          </div>
          <div className={cn(styles.navBurger)}>
            {!burger ? (
              <MenuFoldOutlined className="burger-icon" onClick={() => setBurger(true)} />
            ) : (
              <MenuUnfoldOutlined className="burger-icon" />
            )}
            <Drawer title="Pages" placement="left" onClose={() => setBurger(false)} open={burger}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(styles.burgerItem)}
              >
                <Divider>
                  <NavLink to={WELCOME_ROUTE}>Home page</NavLink>
                </Divider>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(styles.burgerItem)}
              >
                <Divider>
                  <NavLink to={LOGIN_ROUTE}>Log in</NavLink>
                </Divider>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(styles.burgerItem)}
              >
                <Divider>
                  <NavLink to={REGISTRATION_ROUTE}>Registration</NavLink>
                </Divider>
              </motion.div>
            </Drawer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNavbar;
