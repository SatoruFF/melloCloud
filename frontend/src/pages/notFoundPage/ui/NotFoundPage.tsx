import cn from "classnames";
import { useTranslation } from "react-i18next";

import styles from "./NotFoundPage.module.scss";

const NotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<div className={cn(styles.container)}>
			<div className={styles.glitchContainer}>
				<div className={styles.glitch} data-text="404">
					404
				</div>
				<div className={styles.glitchLabel}>
					{t("exceptions.page-not-found")}
				</div>
			</div>
			s
			<p className={styles.message}>{t("exceptions.page-not-found-message")}</p>
		</div>
	);
};

export default NotFoundPage;
