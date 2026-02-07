import { Checkbox, Form, Input, message, notification } from "antd";
import Divider from "antd/es/divider";
import cn from "classnames";
import { Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../../app/store/store";
import { userApi } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";
import { TelegramButton as TelegramLoginButton } from "../../../features/telegramLoginButton";
import { PrimaryButton, Spinner } from "../../../shared";
import { Variables } from "../../../shared/consts/localVariables";
import { ACCESS_DENIED_ROUTE, FILE_ROUTE, REGISTRATION_ROUTE, PRIVACY_POLICY_ROUTE, TERMS_OF_SERVICE_ROUTE } from "../../../shared/consts/routes";
import styles from "../styles/auth.module.scss";

// FIXME
const enableOauth = false;

// TODO: REACT_APP_TELEGRAM_BOT_NAME=YourBotName

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

const YandexIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.74 2h-3.68C5.48 2 2 5.02 2 9.5V14c0 4.48 3.48 8 8 8h1.5v-7h-2v-3h2V9.5c0-2.21 1.79-4 4-4h2.5v3h-2.5c-.55 0-1 .45-1 1V12h3.5l-.5 3h-3v7h1.5c4.52 0 8-3.52 8-8V9.5C22 5.02 18.52 2 13.74 2z" />
  </svg>
);

const Login = () => {
  const { t } = useTranslation();
  const [messageApi, errContextHolder] = message.useMessage();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [setLogin, { isLoading }] = userApi.useLoginMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Проверяем, пришли ли мы с OAuth редиректа
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      messageApi.error(decodeURIComponent(error));
    }

    if (token) {
      localStorage.setItem("token", token);
      // Получаем данные пользователя
      fetch(Variables.User_Auth, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((userData) => {
          dispatch(setUser(userData));
          notification.success({
            message: "Success",
            description: "You have successfully logged in",
            placement: "topLeft",
            icon: <Smile size={20} style={{ color: "#52c41a" }} />,
          });
          navigate(FILE_ROUTE);
        })
        .catch(() => {
          messageApi.error("Failed to get user data");
        });
    }
  }, [searchParams, dispatch, navigate, messageApi]);

  const handleClick = async () => {
    try {
      if (email === "" || password === "") {
        return messageApi.error("Error: some fields are empty");
      }

      const user: any = await setLogin({
        email,
        password,
      }).unwrap();

      const userData = user.data ? user.data : user;
      dispatch(setUser(userData as any));

      notification.open({
        message: "Success log in",
        description: `User with email: ${email} has logged in`,
        placement: "topLeft",
        icon: <Smile size={20} style={{ color: "#52c41a" }} />,
      });

      navigate(FILE_ROUTE);
    } catch (e: any) {
      if (e?.data?.code === "USER_BLOCKED") {
        navigate(ACCESS_DENIED_ROUTE, { replace: true });
        return;
      }
      const errorMsg = e?.data?.message || e?.error || e?.message || "Unknown error occurred";
      messageApi.open({
        type: "error",
        content: errorMsg,
      });
    }
  };

  // OAuth login handlers
  const handleGoogleLogin = () => {
    window.location.href = Variables.Auth_Google;
  };

  const handleYandexLogin = () => {
    window.location.href = Variables.Auth_Yandex;
  };

  // Telegram auth callback
  const handleTelegramAuth = (user: any) => {
    // console.log("Telegram user:", user);
    // Отправляем данные на бэкенд
    const params = new URLSearchParams({
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      photo_url: user.photo_url || "",
      auth_date: user.auth_date,
      hash: user.hash,
    });

    window.location.href = `${Variables.BASE_API_URL}/auth/telegram/callback?${params.toString()}`;
  };

  return (
    <div className={cn(styles.rightSideForm)}>
      {errContextHolder}
      <div className={cn(styles.authFormTitle)}>{t("auth.authorization")}</div>

      <Form layout="vertical">
        <Form.Item label={t("auth.email")} name="email" rules={[{ required: true, message: t("auth.email-warning") }]}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email-placeholder")} />
        </Form.Item>

        <Form.Item
          label={t("auth.password")}
          name="password"
          rules={[{ required: true, message: t("auth.password-warning") }]}
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.password-placeholder")}
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>{t("auth.remember")}</Checkbox>
        </Form.Item>

        <Form.Item>
          <div>
            {isLoading ? (
              <Spinner />
            ) : (
              <PrimaryButton onClick={handleClick} type="submit" theme="primary" fullWidth>
                {t("auth.submit")}
              </PrimaryButton>
            )}
          </div>
        </Form.Item>
      </Form>

      {enableOauth && (
        <>
          <Divider>Or continue with</Divider>

          {/* OAuth Buttons */}
          <div className={styles.oauthButtons}>
            <PrimaryButton className={styles.oauthButton} icon={<GoogleIcon />} onClick={handleGoogleLogin} fullWidth theme="clear">
              Google
            </PrimaryButton>

            {/* Telegram Login Widget */}
            <div className={styles.telegramButtonWrapper}>
              <TelegramLoginButton
                botName={Variables.TELEGRAM_BOT_NAME}
                onAuthCallback={handleTelegramAuth}
                buttonSize="large"
                usePic={false}
              />
            </div>

            <PrimaryButton className={styles.oauthButton} icon={<YandexIcon />} onClick={handleYandexLogin} fullWidth theme="clear">
              Yandex
            </PrimaryButton>
          </div>
        </>
      )}

      <Divider>{t("auth.no-account")}</Divider>

      <NavLink to={REGISTRATION_ROUTE} className={styles.linkAsButton}>
        {t("auth.create-profile")}
      </NavLink>

      <div className={styles.legalLinks}>
        <NavLink to={PRIVACY_POLICY_ROUTE} className={styles.legalLink}>
          {t("legal.privacy.title")}
        </NavLink>
        <span className={styles.legalSeparator}>•</span>
        <NavLink to={TERMS_OF_SERVICE_ROUTE} className={styles.legalLink}>
          {t("legal.terms.title")}
        </NavLink>
      </div>
    </div>
  );
};

export default Login;
