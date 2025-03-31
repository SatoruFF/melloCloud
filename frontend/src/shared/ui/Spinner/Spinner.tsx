import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./spinner.module.scss";

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

const Spinner: React.FC<SpinnerProps> = ({
	size = "default",
	className,
	fullscreen = false,
	tip,
}) => {
	const { t } = useTranslation();

	const spinIcon = (
		<LoadingOutlined
			style={{ fontSize: size === "large" ? 32 : size === "small" ? 16 : 24 }}
			spin
		/>
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
			<div
				className={cn(styles.fullscreenWrapper)}
				role="alert"
				aria-busy="true"
				aria-live="polite"
			>
				{spinner}
			</div>
		);
	}

	return spinner;
};

export default Spinner;
