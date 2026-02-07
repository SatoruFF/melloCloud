import { 
  PieChart, 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  HardDrive, 
  Settings, 
  Globe, 
  Trash2,
  Edit3,
  Key,
  FileText
} from "lucide-react";
import { unwrapResult } from "@reduxjs/toolkit";
import { 
  Button, 
  Card, 
  Col, 
  Row, 
  Statistic, 
  Typography, 
  Upload, 
  message, 
  Divider,
  Modal,
  Input,
  Select
} from "antd";
import type { UploadProps } from "antd";
import cn from "classnames";
import _ from "lodash-es";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { useDeleteAvatarMutation } from "../../../entities/file/model/api/fileApi";
import { useDeleteAccountMutation } from "../../../entities/user/model/api/user";
import { deleteAvatar, setAvatar, logout } from "../../../entities/user/model/slice/userSlice";
import { Spinner } from "../../../shared";
import avatarIcon from "../../../shared/assets/avatar-icon.png";
import { Variables } from "../../../shared/consts/localVariables";
import { sizeFormat } from "../../../shared/utils/sizeFormat";
import styles from "./profile.module.scss";
import { getUserSelector } from "../../../entities/user";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../../../shared/consts/routes";

const { Paragraph } = Typography;

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector(getUserSelector);
  const totalSpace = sizeFormat(user.diskSpace);
  const usedSize = sizeFormat(user.usedSpace);
  const freeSpace = sizeFormat(user.diskSpace - user.usedSpace);
  const usagePercent = ((user.usedSpace / user.diskSpace) * 100).toFixed(1);
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const avatar = user.avatar ? user.avatar : avatarIcon;
  const [removeAvatar, { isLoading: rmAvatarLoad }] = useDeleteAvatarMutation();
  const [deleteAccountMutation, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // Modal states
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [newUserName, setNewUserName] = useState(user.userName);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const props: UploadProps = {
    name: "file",
    action: Variables.UpAvatar_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      const isWEBP = file.type === "image/webp";
      if (!isPNG && !isJPEG && !isWEBP) {
        message.error(`${file.name} is not a valid image file`);
      }
      return isPNG || isJPEG || isWEBP ? true : Upload.LIST_IGNORE;
    },
    onChange(info) {
      if (info.file.status === "done") {
        dispatch(setAvatar(info.file.response));
        message.success(t("messages.avatar-uploaded"));
      } else if (info.file.status === "error") {
        message.error(t("messages.avatar-upload-failed"));
      }
    },
    progress: {
      strokeColor: {
        "0%": "#007bff",
        "100%": "#28a745",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${Number.parseFloat(percent.toFixed(2))}%`,
    },
  };

  const changeAvatarHandler = async () => {
    try {
      if (_.isEmpty(user?.avatar)) return message.error(t("messages.avatar-not-found"));
      const response: any = await removeAvatar();
      unwrapResult(response);
      dispatch(deleteAvatar());
      message.success(t("messages.avatar-deleted"));
    } catch {
      message.error(t("messages.error-occurred"));
    }
  };

  const handleEditName = () => {
    // TODO: API call to update username
    message.info(t("messages.feature-coming-soon"));
    setIsEditNameOpen(false);
  };

  const handleChangePassword = () => {
    // TODO: API call to change password
    message.info(t("messages.feature-coming-soon"));
    setIsChangePasswordOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      message.error(t("user.password-required"));
      return;
    }
    
    try {
      await deleteAccountMutation({ password: deletePassword }).unwrap();
      message.success(t("user.account-deleted"));
      
      // Очищаем данные и перенаправляем на логин
      dispatch(logout());
      localStorage.removeItem("token");
      setIsDeleteAccountOpen(false);
      navigate(LOGIN_ROUTE);
    } catch (error: any) {
      message.error(error?.data?.message || t("messages.error-occurred"));
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    message.success(t("messages.language-changed"));
  };

  return (
    <div className={cn(styles.profileWrapper)}>
      <div className={cn(styles.profileContent)}>
        
        {/* Header Section */}
        <div className={cn(styles.profileHeader)}>
          <h1 className={cn(styles.pageTitle)}>{t("user.profile")}</h1>
        </div>

        {/* Main Profile Card */}
        <Card className={cn(styles.mainCard)} bordered={false}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                <img className={styles.avatar} src={avatar} alt="avatar" loading="lazy" />
              </div>
              <h2 className={styles.username}>{user.userName}</h2>
              <div className={styles.roleBadge}>
                <Shield size={14} />
                <span>{user.role}</span>
              </div>
              <div className={styles.avatarActions}>
                <Upload name="file" maxCount={1} {...props} showUploadList={false}>
                  <Button type="primary" icon={<User size={16} />} block>
                    {t("buttons.upload-avatar")}
                  </Button>
                </Upload>
                {rmAvatarLoad ? (
                  <Spinner />
                ) : (
                  <Button danger icon={<Trash2 size={16} />} onClick={changeAvatarHandler} block>
                    {t("buttons.delete-avatar")}
                  </Button>
                )}
              </div>
            </Col>

            <Col xs={24} md={16}>
              <div className={styles.infoSection}>
                {/* Account Info */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <User size={20} />
                    <h3>{t("user.account-info")}</h3>
                  </div>
                  <div className={styles.infoItem}>
                    <Mail size={16} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t("auth.email")}</span>
                      <Paragraph copyable className={styles.infoValue}>{user.email}</Paragraph>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <User size={16} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t("auth.nickname")}</span>
                      <span className={styles.infoValue}>{user.userName}</span>
                    </div>
                    <Button 
                      type="link" 
                      icon={<Edit3 size={14} />}
                      onClick={() => setIsEditNameOpen(true)}
                    >
                      {t("buttons.edit")}
                    </Button>
                  </div>
                </div>

                <Divider />

                {/* Storage Stats */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <HardDrive size={20} />
                    <h3>{t("user.storage")}</h3>
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card className={styles.statCard}>
                        <Statistic 
                          title={t("user.total-space")} 
                          value={totalSpace}
                          prefix={<HardDrive size={16} />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className={styles.statCard}>
                        <Statistic
                          title={t("user.used-space")}
                          value={usedSize}
                          prefix={<PieChart size={16} />}
                          suffix={`(${usagePercent}%)`}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className={styles.statCard}>
                        <Statistic
                          title={t("user.free-space")}
                          value={freeSpace}
                          prefix={<FileText size={16} />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Settings */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <Settings size={20} />
                    <h3>{t("user.settings")}</h3>
                  </div>
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <div className={styles.settingInfo}>
                        <Globe size={16} />
                        <span>{t("user.language")}</span>
                      </div>
                      <Select
                        value={i18n.language}
                        onChange={handleLanguageChange}
                        style={{ width: 120 }}
                        options={[
                          { value: "en", label: "English" },
                          { value: "ru", label: "Русский" },
                        ]}
                      />
                    </div>
                    <div className={styles.settingItem}>
                      <div className={styles.settingInfo}>
                        <Key size={16} />
                        <span>{t("user.change-password")}</span>
                      </div>
                      <Button onClick={() => setIsChangePasswordOpen(true)}>
                        {t("buttons.change")}
                      </Button>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Danger Zone */}
                <div className={styles.sectionBlock}>
                  <div className={styles.dangerZone}>
                    <div className={styles.dangerInfo}>
                      <Trash2 size={16} />
                      <div>
                        <h4>{t("user.delete-account")}</h4>
                        <p>{t("user.delete-account-warning")}</p>
                      </div>
                    </div>
                    <Button danger onClick={() => setIsDeleteAccountOpen(true)}>
                      {t("buttons.delete-account")}
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Modals */}
      <Modal
        title={t("user.edit-username")}
        open={isEditNameOpen}
        onOk={handleEditName}
        onCancel={() => setIsEditNameOpen(false)}
      >
        <Input
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder={t("auth.nickname-placeholder")}
        />
      </Modal>

      <Modal
        title={t("user.change-password")}
        open={isChangePasswordOpen}
        onOk={handleChangePassword}
        onCancel={() => setIsChangePasswordOpen(false)}
      >
        <Input.Password
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder={t("user.old-password")}
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("user.new-password")}
        />
      </Modal>

      <Modal
        title={t("user.delete-account")}
        open={isDeleteAccountOpen}
        onOk={handleDeleteAccount}
        onCancel={() => {
          setIsDeleteAccountOpen(false);
          setDeletePassword("");
        }}
        okText={t("buttons.delete")}
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
      >
        <p style={{ marginBottom: 16 }}>{t("user.delete-account-confirm")}</p>
        <Input.Password
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder={t("auth.password")}
          disabled={isDeleting}
        />
      </Modal>
    </div>
  );
};

export default Profile;
