import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";
import { X } from "lucide-react";
import styles from "./add-to-home-screen.module.scss";

const STORAGE_KEY = "pwa-add-to-homescreen-dismissed";
const MOBILE_MAX_WIDTH = 768;

const isStandalone = (): boolean => {
  if (typeof window === "undefined") return true;
  // PWA already installed (standalone display mode)
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari
  if ((navigator as { standalone?: boolean }).standalone === true) return true;
  // Android TWA / standalone
  if (document.referrer.includes("android-app://")) return true;
  return false;
};

const isMobileOrTablet = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= MOBILE_MAX_WIDTH;
};

export const AddToHomeScreenBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (isStandalone()) return;
      if (!isMobileOrTablet()) return;
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (_) {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <Alert
        message={t("pwa.addToHomeScreen.message")}
        type="info"
        showIcon
        closable
        closeText={<X size={16} aria-label={t("pwa.addToHomeScreen.dismiss")} />}
        onClose={handleDismiss}
        className={styles.alert}
      />
    </div>
  );
};
