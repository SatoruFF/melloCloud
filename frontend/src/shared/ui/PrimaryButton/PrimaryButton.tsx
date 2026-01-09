import { LoadingOutlined } from "@ant-design/icons";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./primary-button.module.scss";
import React, { memo } from "react";

type ButtonType = "button" | "submit" | "reset";
type Theme = "clear" | "primary" | "danger" | "success";
type Size = "small" | "medium" | "large";

interface PrimaryButtonProps {
  /** Click handler for the button */
  onClick?: () => void;
  /** Content of the button */
  children: React.ReactNode;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Theme of the button */
  theme?: Theme;
  /** HTML button type */
  type?: ButtonType;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Size of the button */
  size?: Size;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Icon to show before the text */
  icon?: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  children,
  disabled = false,
  className,
  theme = "primary",
  type = "button",
  loading = false,
  size = "medium",
  ariaLabel,
  fullWidth = false,
  icon,
}) => {
  const { t } = useTranslation();
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      className={cn(
        styles.mainButton,
        styles[theme],
        styles[size],
        {
          [styles.fullWidth]: fullWidth,
          [styles.loading]: loading,
          [styles.withIcon]: !!icon,
        },
        className
      )}
    >
      {loading && (
        <LoadingOutlined className={styles.loadingIcon} aria-hidden="true" aria-label={t("common.loading")} />
      )}
      {!loading && icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.content}>{children}</span>
    </button>
  );
};

export default memo(PrimaryButton);
