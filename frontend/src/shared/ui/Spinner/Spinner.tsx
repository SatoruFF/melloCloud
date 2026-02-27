import cn from "classnames";
import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./spinner.module.scss";

interface SpinnerProps {
  size?: "small" | "default" | "large";
  className?: string;
  fullscreen?: boolean;
  tip?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "default",
  className,
  fullscreen = false,
  tip,
}) => {
  const { t } = useTranslation();

  const iconSize = size === "large" ? 48 : size === "small" ? 20 : 32;

  const content = (
    <div
      className={cn(styles.spinnerContainer, className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={iconSize} className={styles.icon} />
      <span className={styles.text}>
        {tip || t("common.loading")}
      </span>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={styles.fullscreenOverlay}
        role="alert"
        aria-busy="true"
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Spinner;