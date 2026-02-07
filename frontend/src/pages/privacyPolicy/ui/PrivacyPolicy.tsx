import { useTranslation } from "react-i18next";
import { Card } from "antd";
import styles from "./privacy.module.scss";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Card className={styles.card}>
          <h1 className={styles.title}>{t("legal.privacy.title")}</h1>
          <p className={styles.updateDate}>{t("legal.lastUpdated")}: February 5, 2026</p>

          <section className={styles.section}>
            <h2>{t("legal.privacy.intro.title")}</h2>
            <p>{t("legal.privacy.intro.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.dataCollection.title")}</h2>
            <p>{t("legal.privacy.dataCollection.intro")}</p>
            <ul>
              <li><strong>{t("legal.privacy.dataCollection.account")}:</strong> {t("legal.privacy.dataCollection.accountDesc")}</li>
              <li><strong>{t("legal.privacy.dataCollection.files")}:</strong> {t("legal.privacy.dataCollection.filesDesc")}</li>
              <li><strong>{t("legal.privacy.dataCollection.usage")}:</strong> {t("legal.privacy.dataCollection.usageDesc")}</li>
              <li><strong>{t("legal.privacy.dataCollection.technical")}:</strong> {t("legal.privacy.dataCollection.technicalDesc")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.dataUsage.title")}</h2>
            <ul>
              <li>{t("legal.privacy.dataUsage.service")}</li>
              <li>{t("legal.privacy.dataUsage.improvement")}</li>
              <li>{t("legal.privacy.dataUsage.communication")}</li>
              <li>{t("legal.privacy.dataUsage.security")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.dataProtection.title")}</h2>
            <p>{t("legal.privacy.dataProtection.content")}</p>
            <ul>
              <li>{t("legal.privacy.dataProtection.encryption")}</li>
              <li>{t("legal.privacy.dataProtection.passwords")}</li>
              <li>{t("legal.privacy.dataProtection.access")}</li>
              <li>{t("legal.privacy.dataProtection.monitoring")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.yourRights.title")}</h2>
            <p>{t("legal.privacy.yourRights.intro")}</p>
            <ul>
              <li><strong>{t("legal.privacy.yourRights.access")}:</strong> {t("legal.privacy.yourRights.accessDesc")}</li>
              <li><strong>{t("legal.privacy.yourRights.rectification")}:</strong> {t("legal.privacy.yourRights.rectificationDesc")}</li>
              <li><strong>{t("legal.privacy.yourRights.erasure")}:</strong> {t("legal.privacy.yourRights.erasureDesc")}</li>
              <li><strong>{t("legal.privacy.yourRights.portability")}:</strong> {t("legal.privacy.yourRights.portabilityDesc")}</li>
              <li><strong>{t("legal.privacy.yourRights.objection")}:</strong> {t("legal.privacy.yourRights.objectionDesc")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.cookies.title")}</h2>
            <p>{t("legal.privacy.cookies.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.thirdParty.title")}</h2>
            <p>{t("legal.privacy.thirdParty.content")}</p>
            <ul>
              <li><strong>Telegram:</strong> {t("legal.privacy.thirdParty.telegram")}</li>
              <li><strong>Storage providers:</strong> {t("legal.privacy.thirdParty.storage")}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.dataRetention.title")}</h2>
            <p>{t("legal.privacy.dataRetention.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.changes.title")}</h2>
            <p>{t("legal.privacy.changes.content")}</p>
          </section>

          <section className={styles.section}>
            <h2>{t("legal.privacy.contact.title")}</h2>
            <p>{t("legal.privacy.contact.content")}: <a href="mailto:support@mellocloud.com">support@mellocloud.com</a></p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
