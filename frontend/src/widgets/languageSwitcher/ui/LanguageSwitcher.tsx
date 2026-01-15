import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import styles from "./languageSwitcher.module.scss";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (): void => {
    i18n.changeLanguage(i18n.language === "en" ? "ru" : "en");
  };

  return (
    <div className={cn(styles.translates)}>
      <Globe size={20} onClick={changeLanguage} className={cn(styles.translateToggleBtn)} />
    </div>
  );
};

export default LanguageSwitcher;
