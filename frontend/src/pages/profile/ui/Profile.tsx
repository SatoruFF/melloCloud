import { PieChartOutlined } from "@ant-design/icons";
import { unwrapResult } from "@reduxjs/toolkit";
import { Button, Card, Col, Row, Spin, Statistic, Typography, Upload, message, Tooltip } from "antd";
import type { UploadProps } from "antd";
import cn from "classnames";
import _ from "lodash-es";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { useDeleteAvatarMutation } from "../../../entities/file/model/api/fileApi";
import { deleteAvatar, setAvatar } from "../../../entities/user/model/slice/userSlice";
import { Spinner } from "../../../shared";
import avatarIcon from "../../../shared/assets/avatar-icon.png";
import { Variables } from "../../../shared/consts/localVariables";
import { sizeFormat } from "../../../shared/utils/sizeFormat";
import styles from "./profile.module.scss";
import { getUserSelector } from "../../../entities/user";

const { Paragraph } = Typography;

const Profile = () => {
  const { t } = useTranslation();
  const user = useAppSelector(getUserSelector);
  const totalSpace = sizeFormat(user.diskSpace);
  const usedSize = sizeFormat(user.usedSpace);
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const avatar = user.avatar ? user.avatar : avatarIcon;
  const [removeAvatar, { isLoading: rmAvatarLoad }] = useDeleteAvatarMutation();

  const props: UploadProps = {
    name: "file",
    action: Variables.UpAvatar_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      if (!isPNG && !isJPEG) {
        message.error(`${file.name} is not a png or jpeg file`);
      }
      return isPNG || isJPEG ? true : Upload.LIST_IGNORE;
    },
    onChange(info) {
      if (info.file.status === "done") {
        dispatch(setAvatar(info.file.response));
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} upload failed. File may already exist.`);
      }
    },
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${Number.parseFloat(percent.toFixed(2))}%`,
    },
  };

  const changeAvatarHandler = async () => {
    try {
      if (_.isEmpty(user?.avatar)) return message.error("Avatar not found");
      const response: any = await removeAvatar();
      unwrapResult(response);
      dispatch(deleteAvatar());
      message.success("Avatar successfully deleted");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={cn(styles.profileWrapper)}>
      <div className={cn(styles.profileContent)}>
        <Card className={cn(styles.profileCard)} bordered={false} hoverable>
          <Row gutter={[24, 24]} className={styles.profileLayout}>
            <Col xs={24} md={8} className={styles.avatarSection}>
              <img className={styles.avatar} src={avatar} alt="avatar" loading="lazy" />
              <div className={styles.buttonGroup}>
                {rmAvatarLoad ? (
                  <Spinner />
                ) : (
                  <Button danger onClick={changeAvatarHandler}>
                    {t("buttons.delete-avatar")}
                  </Button>
                )}
                <Upload name="file" maxCount={1} {...props} showUploadList={false}>
                  <Button type="primary">{t("buttons.upload-avatar")}</Button>
                </Upload>
              </div>
            </Col>
            <Col xs={24} md={16} className={styles.detailsSection}>
              <div className={styles.username}>{user.userName}</div>
              <Paragraph copyable className={styles.email}>
                {t("auth.email")}: {user.email}
              </Paragraph>
              <Paragraph className={styles.role}>
                {t("user.role")}: {user.role}
              </Paragraph>
              <Row gutter={16} className={styles.statGrid}>
                <Col span={12}>
                  <Card>
                    <Statistic title={t("user.total-space")} value={totalSpace} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title={t("user.used-space")}
                      value={usedSize}
                      precision={2}
                      prefix={<PieChartOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
