import { SmileOutlined, GoogleOutlined } from "@ant-design/icons";
import { unwrapResult } from "@reduxjs/toolkit";
import { Button, Form, Input, message, notification } from "antd";
import Divider from "antd/es/divider";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/store/store";
import { userApi } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";
import { ACTIVATION_ROUTE, LOGIN_ROUTE } from "../../../shared/consts/routes";
import { Variables } from "../../../shared/consts/localVariables";
import cn from "classnames";
import { Spinner } from "../../../shared";
import styles from "../styles/auth.module.scss";

const TelegramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const YandexIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.74 2h-3.68C5.48 2 2 5.02 2 9.5V14c0 4.48 3.48 8 8 8h1.5v-7h-2v-3h2V9.5c0-2.21 1.79-4 4-4h2.5v3h-2.5c-.55 0-1 .45-1 1V12h3.5l-.5 3h-3v7h1.5c4.52 0 8-3.52 8-8V9.5C22 5.02 18.52 2 13.74 2z" />
  </svg>
);

const Register = () => {
  const { t } = useTranslation();
  const [messageApi, errContextHolder] = message.useMessage();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [regUser, { isLoading }] = userApi.useRegistrationMutation();

  const handleCreate = async () => {
    try {
      if (email === "" || password === "" || userName === "") {
        return messageApi.error("Error: some fields are empty");
      }

      const inviteData = await regUser({
        userName,
        email,
        password,
      });

      unwrapResult(inviteData);
      dispatch(setUser(inviteData.data as any));

      notification.open({
        message: "Success registration",
        description: `User with email: ${email} was created`,
        placement: "topLeft",
        icon: <SmileOutlined style={{ color: "#108ee9" }} />,
      });

      navigate(ACTIVATION_ROUTE);
    } catch (e: any) {
      const errorMsg = e?.data?.message || e?.error || e?.message || "Unknown error occurred";
      messageApi.open({
        type: "error",
        content: errorMsg,
      });
    }
  };

  const handleOAuthLogin = (provider: "google" | "telegram" | "yandex") => {
    const oauthUrls = {
      google: Variables.Auth_Google,
      telegram: Variables.Auth_Telegram,
      yandex: Variables.Auth_Yandex,
    };
    window.location.href = oauthUrls[provider];
  };

  return (
    <div className={cn(styles.rightSideForm)}>
      {errContextHolder}
      <div className={cn(styles.authFormTitle)}>{t("auth.registration")}</div>

      <Form layout="vertical">
        <Form.Item
          label={t("auth.nickname")}
          name="firstName"
          rules={[{ required: true, message: t("auth.nickname-warning") }]}
        >
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t("auth.nickname-placeholder")}
          />
        </Form.Item>

        <Form.Item label={t("auth.email")} name="email" rules={[{ required: true, message: t("auth.email-warning") }]}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email-placeholder")} />
        </Form.Item>

        <Form.Item
          label={t("auth.password")}
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="please input your password here..."
          />
        </Form.Item>
      </Form>

      <div>
        {isLoading ? (
          <Spinner />
        ) : (
          <Button onClick={handleCreate} type="primary" htmlType="submit" block>
            {t("auth.submit")}
          </Button>
        )}
      </div>

      <Divider>Or sign up with</Divider>

      {/* OAuth Buttons */}
      <div className={styles.oauthButtons}>
        <Button
          className={styles.oauthButton}
          icon={<GoogleOutlined />}
          onClick={() => handleOAuthLogin("google")}
          block
        >
          Google
        </Button>

        <Button
          className={styles.oauthButton}
          icon={<TelegramIcon />}
          onClick={() => handleOAuthLogin("telegram")}
          block
        >
          Telegram
        </Button>

        <Button className={styles.oauthButton} icon={<YandexIcon />} onClick={() => handleOAuthLogin("yandex")} block>
          Yandex
        </Button>
      </div>

      <Divider orientation="left">{t("auth.have-account")}</Divider>

      <Button block>
        <NavLink to={LOGIN_ROUTE}>{t("auth.authorization")}</NavLink>
      </Button>
    </div>
  );
};

export default Register;
