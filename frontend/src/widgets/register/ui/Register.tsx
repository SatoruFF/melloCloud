import { unwrapResult } from "@reduxjs/toolkit";
import { Form, Input, message, notification } from "antd";
import Divider from "antd/es/divider";
import cn from "classnames";
import { Smile } from "lucide-react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/store/store";
import { userApi } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";
import { PrimaryButton, Spinner } from "../../../shared";
import { Variables } from "../../../shared/consts/localVariables";
import { ACTIVATION_ROUTE, LOGIN_ROUTE } from "../../../shared/consts/routes";
import styles from "../styles/auth.module.scss";

// FIXME
const enableOauth = false;

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

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
        icon: <Smile size={20} style={{ color: "#108ee9" }} />,
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
          <PrimaryButton onClick={handleCreate} type="submit" theme="primary" fullWidth>
            {t("auth.submit")}
          </PrimaryButton>
        )}
      </div>
      {enableOauth && (
        <>
          <Divider>Or sign up with</Divider>
          {/* OAuth Buttons */}
          <div className={styles.oauthButtons}>
            <PrimaryButton
              className={styles.oauthButton}
              icon={<GoogleIcon />}
              onClick={() => handleOAuthLogin("google")}
              fullWidth
              theme="clear"
            >
              Google
            </PrimaryButton>

            <PrimaryButton
              className={styles.oauthButton}
              icon={<TelegramIcon />}
              onClick={() => handleOAuthLogin("telegram")}
              fullWidth
              theme="clear"
            >
              Telegram
            </PrimaryButton>

            <PrimaryButton
              className={styles.oauthButton}
              icon={<YandexIcon />}
              onClick={() => handleOAuthLogin("yandex")}
              fullWidth
              theme="clear"
            >
              Yandex
            </PrimaryButton>
          </div>
        </>
      )}

      <Divider orientation="left">{t("auth.have-account")}</Divider>
      <NavLink to={LOGIN_ROUTE} className={styles.linkAsButton}>
        {t("auth.authorization")}
      </NavLink>
    </div>
  );
};

export default memo(Register);
