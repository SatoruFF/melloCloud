import { Plug, Menu, X, Settings, User } from "lucide-react";
import { Avatar, Divider, Drawer, Tooltip, notification } from "antd";
import cn from "classnames";
import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { NavLink, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { logout } from "../../../entities/user/model/slice/userSlice";
import WorkspacesDropdown from "../../../features/workspaceDropdown/ui/WorkspacesDropdown";
// import avatarIcon from "../../../shared/assets/avatar-icon.png";
import {
  FILE_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
  WELCOME_ROUTE,
} from "../../../shared/consts/routes";
import { PrimaryButton } from "../../../shared";
import { getFeatureFlag } from "../../../shared/lib/features/setGetFeatures";
import AccountSettings from "../../accountSettings/ui/AccountSettings.";

import { Notifications } from "../../../features/notifications";
import LanguageSwitcher from "../../languageSwitcher/ui/LanguageSwitcher";
import styles from "./navbar.module.scss";
import { checkIsAdmin, getUserAuthSelector, getUserSelector } from "../../../entities/user";

const MyNavbar: React.FC = () => {
  const { t } = useTranslation();
  const isAuth = useAppSelector(getUserAuthSelector);
  const user = useAppSelector(getUserSelector);
  const isAdmin = useAppSelector(checkIsAdmin);
  const [profile, setProfile] = useState(false);
  const [burger, setBurger] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  const logOut = useCallback(() => {
    dispatch(logout());
    navigate(WELCOME_ROUTE);
    notification.open({
      message: t("auth.logout-success"),
      description: t("auth.logout-description"),
      placement: "topLeft",
      icon: <Plug size={20} style={{ color: "#ff7875" }} />,
    });
  }, [dispatch, navigate, t]);

  const handleLogoClick = () => {
    navigate(WELCOME_ROUTE);
  };

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(WELCOME_ROUTE);
    }
  };

  const handleAvatarClick = () => {
    navigate(PROFILE_ROUTE);
  };

  const handleAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(PROFILE_ROUTE);
    }
  };

  return (
    <header className={cn(styles.navbar)} data-testid="navbar">
      <div className={cn(styles.baseItems)}>
        <LanguageSwitcher />
        <div
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          className={cn(styles.mainLogo)}
          role="button"
          tabIndex={0}
          aria-label={t("home-anchor.title")}
        >
          <p className={cn(styles.applicationName)}>{t("application-name")}</p>
        </div>
      </div>

      {isAuth ? (
        <div className={cn(styles.navItems)}>
          {!isTabletOrMobile && getFeatureFlag("files") && (
            <>
              <div className={cn(styles.navFiles)}>
                <NavLink to={FILE_ROUTE} className={cn(styles.navLinkButton, styles.links)}>
                  {t("files.my-files")}
                </NavLink>
              </div>
            </>
          )}

          <WorkspacesDropdown setProfile={setProfile} logOut={logOut} viewAll={isTabletOrMobile} isAdmin={isAdmin} />

          <div className={cn(styles.navUser)}>
            {!isTabletOrMobile && (
              <Tooltip title={t("user.settings")}>
                <div className={cn(styles.userInfo)} onClick={() => setProfile(true)}>
                  <p>{user?.userName}</p>
                  <Settings size={16} />
                </div>
              </Tooltip>
            )}
            <Notifications />
            <div
              className={cn(styles.avatar)}
              onClick={handleAvatarClick}
              onKeyDown={handleAvatarKeyDown}
              role="button"
              tabIndex={0}
              aria-label={t("user.profile-info")}
            >
              {user?.avatar ? (
                <Avatar size={40} src={user.avatar} alt={user?.userName || t("user.avatar")} />
              ) : (
                <Avatar size={40} icon={<User size={20} />} style={{ backgroundColor: "#1890ff" }} />
              )}
            </div>
            <PrimaryButton className={cn(styles.mainLogout)} theme="primary" onClick={logOut}>
              {t("auth.logout")}
            </PrimaryButton>
          </div>
          <Drawer
            title={t("user.settings")}
            placement="right"
            onClose={() => setProfile(false)}
            open={profile}
            className={styles.settingsDrawer}
            contentWrapperStyle={{ backgroundColor: "#1f1f1f" }}
            styles={{ body: { backgroundColor: "#1f1f1f" }, header: { backgroundColor: "#1f1f1f", borderBottomColor: "#303030" } }}
          >
            <AccountSettings />
          </Drawer>
        </div>
      ) : (
        <div className={cn(styles.navItems)}>
          <div className={cn(styles.navItem)}>
            <NavLink to={LOGIN_ROUTE} className={cn(styles.navLinkButton, styles.links)}>
              {t("auth.authorization")}
            </NavLink>
          </div>
          <div className={cn(styles.navItem)}>
            <NavLink to={REGISTRATION_ROUTE} className={cn(styles.navLinkButton, styles.links)}>
              {t("auth.registration")}
            </NavLink>
          </div>
          <div className={cn(styles.navBurger)}>
            {!burger ? (
              <Menu size={24} className="burger-icon" onClick={() => setBurger(true)} />
            ) : (
              <X size={24} className="burger-icon" />
            )}
            <Drawer title={t("navbar.pages")} placement="left" onClose={() => setBurger(false)} open={burger}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(styles.burgerItem)}
              >
                <Divider>
                  <NavLink to={WELCOME_ROUTE} className={cn(styles.links)}>
                    {t("navbar.home")}
                  </NavLink>
                </Divider>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(styles.burgerItem)}
              >
                <Divider>
                  <NavLink to={LOGIN_ROUTE} className={cn(styles.links)}>
                    {t("auth.authorization")}
                  </NavLink>
                </Divider>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(styles.burgerItem)}
              >
                <Divider>
                  <NavLink to={REGISTRATION_ROUTE} className={cn(styles.links)}>
                    {t("auth.registration")}
                  </NavLink>
                </Divider>
              </motion.div>
            </Drawer>
          </div>
        </div>
      )}
    </header>
  );
};

export default MyNavbar;
