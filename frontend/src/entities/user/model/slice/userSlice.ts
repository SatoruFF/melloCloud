import { createSlice } from "@reduxjs/toolkit";
import type { UserSchema } from "../..";

const initialState: UserSchema = {
	token: "",
	isAuth: false,
	isUserLoading: true,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: any) => {
			if (action.payload && action.payload.user) {
				state.user = action.payload.user;
				state.isAuth = true;
				state.isUserLoading = false;
				localStorage.setItem("token", action.payload.token);
			}
		},
		logout: (state) => {
			state.isAuth = false;
			state.user = {};
			state.token = null;
			localStorage.removeItem("token");
		},
		setUserLoading: (state) => {
			state.isUserLoading = !state;
		},
		deleteAvatar: (state) => {
			state.user.avatar = null;
		},
		setAvatar: (state, action: any) => {
			state.user.avatar = action.payload;
		},
	},
});

export const { setUser, logout, setAvatar, deleteAvatar, setUserLoading } =
	userSlice.actions;
export default userSlice.reducer;
