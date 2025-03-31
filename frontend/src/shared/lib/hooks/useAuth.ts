import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../../app/store/store";
import { userApi } from "../../../entities/user/model/api/user";
import { setUser } from "../../../entities/user/model/slice/userSlice";
import { ACTIVATION_ROUTE, FILE_ROUTE } from "../../consts/routes";

export const useAuth = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [setLogin, { isLoading: isLoggingIn }] = userApi.useLoginMutation();
	const [registerUser, { isLoading: isRegistering }] =
		userApi.useRegistrationMutation();

	const login = async (email: string, password: string) => {
		if (!email || !password) {
			return message.error("Error: some fields are empty");
		}

		try {
			const user = await setLogin({ email, password }).unwrap();
			dispatch(setUser(user));
			navigate(FILE_ROUTE);
		} catch (e: any) {
			message.error(`Error: ${e.data?.message || e.error}`);
		}
	};

	const register = async (
		userName: string,
		email: string,
		password: string,
	) => {
		if (!userName || !email || !password) {
			return message.error("Error: some fields are empty");
		}

		try {
			const inviteData = await registerUser({
				userName,
				email,
				password,
			}).unwrap();
			dispatch(setUser(inviteData));
			navigate(ACTIVATION_ROUTE);
		} catch (e: any) {
			message.error(`Error: ${e.data?.message || e.error}`);
		}
	};

	return { login, register, isLoggingIn, isRegistering };
};
