// @ts-nocheck
import { LogOut, Edit, Lock, Trash2, User, Mail } from "lucide-react";
import { Button, Card, Space, Typography, notification } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { logout } from "../../../entities/user/model/slice/userSlice";
import DeleteModal from "../../../features/deleteModal/ui/DeleteModal";
import InfoModal from "../../../features/infoModal/ui/InfoModal";
import PasswordModal from "../../../features/passwordModal/ui/PasswordModal";
import { WELCOME_ROUTE } from "../../../shared/consts/routes";
import { sizeFormat } from "../../../shared/utils/sizeFormat";
import { getUserSelector } from "../../../entities/user";

import styles from "./accountSettings.module.scss";

const { Title, Text } = Typography;

const AccountSettings = () => {
  const { t } = useTranslation();
  const [changeInfoModal, setChangeInfoModal] = useState(false);
  const [changePassModal, setChangePassModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const user = useAppSelector(getUserSelector);
  const totalSpace = sizeFormat(user.diskSpace);
  const usedSize = sizeFormat(user.usedSpace);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logOut = () => {
    dispatch(logout());
    navigate(WELCOME_ROUTE);
    notification.open({
      message: t("auth.logout"),
      description: t("auth.logout-success"),
      placement: "topLeft",
      icon: <LogOut size={20} style={{ color: "#ff7875" }} />,
    });
  };

  return (
    <div className={styles.settingsPage}>
      <Space direction="vertical" size="large" className={styles.cardList}>
        <Card className={styles.card}>
          <Title level={4}>{t("user.profile-info")}</Title>
          <Space direction="vertical" size="middle" className={styles.cardContent}>
            <Text>
              <User size={16} style={{ marginRight: 8 }} /> {t("auth.nickname")}: <strong>{user.userName}</strong>
            </Text>
            <Text>
              <Mail size={16} style={{ marginRight: 8 }} /> {t("auth.email")}: <strong>{user.email}</strong>
            </Text>
            <Text>
              {t("user.role")}: <strong>{user.role}</strong>
            </Text>
            <Text>
              {t("user.disk")}:{" "}
              <strong>
                {usedSize} / {totalSpace}
              </strong>
            </Text>
            <Button type="primary" danger icon={<LogOut size={16} />} onClick={logOut} className={styles.logoutButton}>
              {t("auth.logout")}
            </Button>
          </Space>
        </Card>

        <Card className={styles.card}>
          <Title level={4}>{t("user.actions")}</Title>
          <Space direction="vertical" className={styles.cardContent}>
            <Button icon={<Edit size={16} />} block onClick={() => setChangeInfoModal(true)}>
              {t("auth.change-profile-info")}
            </Button>
            <Button icon={<Lock size={16} />} block onClick={() => setChangePassModal(true)}>
              {t("auth.change-password")}
            </Button>
            <Button icon={<Trash2 size={16} />} danger block onClick={() => setDeleteModal(true)}>
              {t("auth.delete-account")}
            </Button>
          </Space>
        </Card>
      </Space>

      <InfoModal status={changeInfoModal} def={setChangeInfoModal} />
      <PasswordModal status={changePassModal} def={setChangePassModal} />
      <DeleteModal status={deleteModal} def={setDeleteModal} />
    </div>
  );
};

export default AccountSettings;
