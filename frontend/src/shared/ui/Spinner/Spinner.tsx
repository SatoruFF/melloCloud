import { Loader2 } from "lucide-react";
import { Spin } from "antd";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./spinner.module.scss";
import React from "react";

interface SpinnerProps {
  /** Size of the spinner (small, default, large) */
  size?: "small" | "default" | "large";
  /** Custom class name for the spinner container */
  className?: string;
  /** Whether to show the spinner with a fullscreen overlay */
  fullscreen?: boolean;
  /** Custom loading text */
  tip?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "default", className, fullscreen = false, tip }) => {
  const { t } = useTranslation();

  const iconSize = size === "large" ? 32 : size === "small" ? 16 : 24;

  const spinIcon = (
    <Loader2 size={iconSize} className={styles.spinningIcon} style={{ animation: "spin 1s linear infinite" }} />
  );

  const spinner = (
    <div className={cn(styles.spinnerWrapper)} role="status" aria-live="polite">
      <Spin
        indicator={spinIcon}
        size={size}
        className={cn(styles.spinner, className)}
        tip={tip || t("common.loading")}
      />
    </div>
  );

  if (fullscreen) {
    return (
      <div className={cn(styles.fullscreenWrapper)} role="alert" aria-busy="true" aria-live="polite">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
