import { CheckSquare, XCircle } from "lucide-react";
import { message } from "antd";
import cn from "classnames";
import _ from "lodash-es";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { useActivateUserMutation } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";
import { FILE_ROUTE } from "../../../shared/consts/routes";
import styles from "./activate.module.scss";
import { useTranslation } from "react-i18next";

const Activate = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const [activateUser, { isLoading, isSuccess, isError, error }]: any = useActivateUserMutation();
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const email = user?.currentUser && "email" in user.currentUser ? user.currentUser.email : undefined;

  const handleActivate = async () => {
    if (!token) throw new Error(t("auth.activate.invalidToken"));
    const user = await activateUser(token).unwrap();
    if (error) {
      return message.error(`error: ${error.error}`);
    }
    const userData = user.data ? user.data : user;
    dispatch(setUser(userData as any));
    navigate(FILE_ROUTE);
  };

  useEffect(() => {
    if (token) {
      setStatus("loading");
      handleActivate()
        .then(() => setStatus("success"))
        .catch((e) => {
          message.error(
            t("auth.activate.errorWithAccount", {
              message: _.get(e, ["data", "message"], t("auth.activate.defaultError")),
            })
          );
          setStatus("error");
        });
    }
  }, [token, activateUser]);

  if (isLoading || status === "loading") {
    return <div className={cn(styles.loading, "animate__animated animate__jello")}>{t("auth.activate.loading")}</div>;
  }

  if (isSuccess || status === "success") {
    return (
      <div className={cn(styles.activateContainer)}>
        <div className={cn(styles.activateMessage)}>
          <div className={cn(styles.activateIcon)}>
            <CheckSquare size={64} color="#52c41a" />
          </div>
          <h1>{t("auth.activate.successTitle")}</h1>
          <p>
            {_.isEmpty(user)
              ? t("auth.activate.successMessage")
              : t("auth.activate.successMessageWithEmail", { email })}
          </p>
        </div>
      </div>
    );
  }

  if (isError || status === "error") {
    return (
      <div className={cn(styles.activateContainer)}>
        <div className={cn(styles.activateMessage)}>
          <div className={cn(styles.activateIcon)}>
            <XCircle size={64} color="#ff4d4f" />
          </div>
          <h1>{t("auth.activate.failedTitle")}</h1>
          <p>{t("auth.activate.failedMessage")}</p>
          <p>{t("auth.activate.contactSupport")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.activateContainer)}>
      <div className={cn(styles.activateMessage)}>
        <div className={cn(styles.activateIcon)}>
          <CheckSquare size={64} color="#52c41a" />
        </div>
        <h1>{t("auth.activate.emailSentTitle")}</h1>
        <p className={cn(styles.activateInfo)}>
          {t("auth.activate.emailSentMessage", {
            email: _.isEmpty(user) ? "" : `(${email})`,
          })}
        </p>
        <p className={cn(styles.activateWarning)}>{t("auth.activate.checkSpam")}</p>
      </div>
    </div>
  );
};

export default Activate;
