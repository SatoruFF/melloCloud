import cn from "classnames";
import { useTranslation } from "react-i18next";

import { GlobalOutlined } from "@ant-design/icons";
import styles from "./languageSwitcher.module.scss";

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();

	const changeLanguage = (): void => {
		i18n.changeLanguage(i18n.language === "en" ? "ru" : "en");
	};

	return (
		<div className={cn(styles.translates)}>
			<GlobalOutlined
				onClick={changeLanguage}
				className={cn(styles.translateToggleBtn)}
			/>
		</div>
	);
};

export default LanguageSwitcher;
