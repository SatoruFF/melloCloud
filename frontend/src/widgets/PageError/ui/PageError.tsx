import { CopyOutlined } from "@ant-design/icons";
import { Button, Collapse } from "antd";
import cn from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./PageError.module.scss";

interface PageErrorProps {
	error?: Error;
}

const PageError = ({ error }: PageErrorProps) => {
	const { t } = useTranslation();
	const [expanded, setExpanded] = useState(false);

	const reloadPage = () => location.reload();

	const copyError = async () => {
		if (error) {
			await navigator.clipboard.writeText(error.stack || error.message);
		}
	};

	return (
		<div className={cn(styles.pageErrorWrapper)}>
			<div className={cn(styles.pageErrorContent)}>
				<p className={cn(styles.pageErrorTitle)}>
					{t("exceptions.just-error")}
				</p>
				{error && (
					<div className={cn(styles.errorDetails)}>
						<Collapse
							activeKey={expanded ? ["1"] : []}
							defaultActiveKey={["1"]}
							onChange={() => setExpanded(!expanded)}
						>
							<Collapse.Panel header={t("exceptions.details")} key="1">
								<pre className={cn(styles.errorStack)}>
									{error.stack || error.message}
								</pre>
								<Button icon={<CopyOutlined />} onClick={copyError}>
									{t("buttons.copy-error")}
								</Button>
							</Collapse.Panel>
						</Collapse>
					</div>
				)}
				<Button onClick={reloadPage}>{t("buttons.reload-page")}</Button>
			</div>
		</div>
	);
};

export default PageError;
