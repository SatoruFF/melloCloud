import { SmileOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, notification } from "antd";
import Divider from "antd/es/divider";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../../app/store/store";
import { userApi } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";
import { FILE_ROUTE, REGISTRATION_ROUTE } from "../../../shared/consts/routes";
import { Variables } from "../../../shared/consts/localVariables";
import cn from "classnames";
import { Spinner } from "../../../shared";
import { TelegramButton as TelegramLoginButton } from "../../../features/telegramLoginButton";
import styles from "../styles/auth.module.scss";

// TODO: REACT_APP_TELEGRAM_BOT_NAME=YourBotName

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
            icon: <SmileOutlined style={{ color: "#52c41a" }} />,
          });
          navigate(FILE_ROUTE);
        })
        .catch((err) => {
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
        icon: <SmileOutlined style={{ color: "#52c41a" }} />,
      });

      navigate(FILE_ROUTE);
    } catch (e: any) {
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
              <Button onClick={handleClick} type="primary" htmlType="submit" block>
                {t("auth.submit")}
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>

      <Divider>Or continue with</Divider>

      {/* OAuth Buttons */}
      <div className={styles.oauthButtons}>
        <Button className={styles.oauthButton} icon={<GoogleOutlined />} onClick={handleGoogleLogin} block>
          Google
        </Button>

        {/* Telegram Login Widget */}
        <div className={styles.telegramButtonWrapper}>
          <TelegramLoginButton
            botName={process.env.REACT_APP_TELEGRAM_BOT_NAME || "YourBotName"}
            onAuthCallback={handleTelegramAuth}
            buttonSize="large"
            usePic={false}
          />
        </div>

        <Button className={styles.oauthButton} icon={<YandexIcon />} onClick={handleYandexLogin} block>
          Yandex
        </Button>
      </div>

      <Divider orientation="left">{t("auth.no-account")}</Divider>

      <Button block>
        <NavLink to={REGISTRATION_ROUTE}>{t("auth.create-profile")}</NavLink>
      </Button>
    </div>
  );
};

export default Login;
