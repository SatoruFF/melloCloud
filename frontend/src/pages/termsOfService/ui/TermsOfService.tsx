import { useTranslation } from "react-i18next";
import { Card } from "antd";
import styles from "./terms.module.scss";

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Card className={styles.card}>
          <h1 className={styles.title}>{t("legal.terms.title")}</h1>
          <p className={styles.updateDate}>{t("legal.lastUpdated")}: February 5, 2026</p>

          <section className={styles.section}>
            <h2>{t("legal.terms.acceptance.title")}</h2>
            <p>{t("legal.terms.acceptance.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.description.title")}</h2>
            <p>{t("legal.terms.description.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.account.title")}</h2>
            <ul>
              <li>{t("legal.terms.account.responsibility")}</li>
              <li>{t("legal.terms.account.accuracy")}</li>
              <li>{t("legal.terms.account.security")}</li>
              <li>{t("legal.terms.account.unauthorized")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.usage.title")}</h2>
            <p>{t("legal.terms.usage.intro")}</p>
            <ul>
              <li>{t("legal.terms.usage.illegal")}</li>
              <li>{t("legal.terms.usage.harmful")}</li>
              <li>{t("legal.terms.usage.infringe")}</li>
              <li>{t("legal.terms.usage.spam")}</li>
              <li>{t("legal.terms.usage.interfere")}</li>
              <li>{t("legal.terms.usage.impersonate")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.content.title")}</h2>
            <p>{t("legal.terms.content.ownership")}</p>
            <p>{t("legal.terms.content.responsibility")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.storage.title")}</h2>
            <p>{t("legal.terms.storage.limits")}</p>
            <p>{t("legal.terms.storage.backup")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.termination.title")}</h2>
            <p>{t("legal.terms.termination.right")}</p>
            <p>{t("legal.terms.termination.effect")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.disclaimer.title")}</h2>
            <p>{t("legal.terms.disclaimer.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.limitation.title")}</h2>
            <p>{t("legal.terms.limitation.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.changes.title")}</h2>
            <p>{t("legal.terms.changes.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.governing.title")}</h2>
            <p>{t("legal.terms.governing.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.terms.contact.title")}</h2>
            <p>{t("legal.terms.contact.content")}: <a href="mailto:support@mellocloud.com">support@mellocloud.com</a></p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
