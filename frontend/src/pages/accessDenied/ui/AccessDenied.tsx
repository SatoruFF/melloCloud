import cn from "classnames";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { LOGIN_ROUTE, WELCOME_ROUTE } from "../../../shared/consts/routes";
import styles from "./access-denied.module.scss";

const AccessDenied = () => {
  const { t } = useTranslation();

  return (
    <div className={cn(styles.root)}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <Heart size={48} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>{t("access-denied.title")}</h1>
        <p className={styles.message}>{t("access-denied.message")}</p>
        <p className={styles.wish}>{t("access-denied.wish")}</p>
        <div className={styles.actions}>
          <NavLink to={WELCOME_ROUTE} className={styles.link}>
            <ArrowLeft size={18} />
            {t("access-denied.home")}
          </NavLink>
          <NavLink to={LOGIN_ROUTE} className={styles.linkPrimary}>
            {t("access-denied.sign-in-another")}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
