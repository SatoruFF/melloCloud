import { CheckSquareTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { message } from "antd";
import cn from "classnames";
import _ from "lodash-es";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { useActivateUserMutation } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";

import { FILE_ROUTE } from "../../../shared/consts/routes";
import styles from "../styles/activate.module.scss";

const Activate = () => {
	const user = useAppSelector((state) => state.user);
	const [searchParams] = useSearchParams();
	const [activateUser, { isLoading, isSuccess, isError, error }]: any =
		useActivateUserMutation();
	const [status, setStatus] = useState<
		"idle" | "success" | "error" | "loading"
	>("idle");
	const token = searchParams.get("token");
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleActivate = async () => {
		if (!token) throw new Error("Invalid token");
		const user = await activateUser(token).unwrap();
		if (error) {
			return message.error(`error: ${error.error}`);
		}
		const userData = user.data ? user.data : user;
		dispatch(setUser(userData as any));
		navigate(FILE_ROUTE);
	};

	useEffect(() => {
		if (token) {
			setStatus("loading");
			handleActivate()
				.then(() => setStatus("success"))
				.catch((e) => {
					message.error(
						`error with activate account: ${_.get(e, ["data", "message"], "some error with token")}`,
					);
					setStatus("error");
				});
		}
	}, [token, activateUser]);

	if (isLoading || status === "loading") {
		return <div className={styles.loading}>Activating your account...</div>;
	}

	if (isSuccess || status === "success") {
		return (
			<div className={cn(styles.activateContainer)}>
				<div className={cn(styles.activateMessage)}>
					<div className={cn(styles.activateIcon)}>
						<CheckSquareTwoTone />
					</div>
					<h1>Account Successfully Activated!</h1>
					<p>
						{_.isEmpty(user)
							? "Your account has been activated. You can now log in."
							: `Account for ${user?.email} has been activated.`}
					</p>
				</div>
			</div>
		);
	}

	if (isError || status === "error") {
		return (
			<div className={cn(styles.activateContainer)}>
				<div className={cn(styles.activateMessage)}>
					<div className={cn(styles.activateIcon)}>
						<CloseCircleTwoTone twoToneColor="red" />
					</div>
					<h1>Activation Failed</h1>
					<p>
						We couldn’t activate your account. The link may have expired or is
						invalid.
					</p>
					<p>Please try registering again or contact support for help.</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn(styles.activateContainer)}>
			<div className={cn(styles.activateMessage)}>
				<div className={cn(styles.activateIcon)}>
					<CheckSquareTwoTone />
				</div>
				<h1>Activation Email Sent</h1>
				<p className={cn(styles.activateInfo)}>
					We have sent an activation email{" "}
					{_.isEmpty(user) ? "" : `(${user?.email})`} to your registered email
					address. Please check your inbox to activate your account.
				</p>
				<p className={cn(styles.activateWarning)}>
					If you didn’t receive the email, please try registering again or check
					your spam folder.
				</p>
			</div>
		</div>
	);
};

export default Activate;
