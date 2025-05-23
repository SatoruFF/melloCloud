import { createSlice } from '@reduxjs/toolkit';
import type { UserSchema } from '../..';

const initialState: UserSchema = {
  currentUser: {},
  token: '',
  isAuth: false,
  isUserLoading: true,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: any) => {
      if (action.payload && action.payload.user) {
        state.currentUser = action.payload.user;
        state.isAuth = true;
        state.isUserLoading = false;
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: state => {
      state.isAuth = false;
      state.currentUser = {};
      state.token = null;
      localStorage.removeItem('token');
    },
    setUserLoading: state => {
      state.isUserLoading = !state;
    },
    deleteAvatar: state => {
      if (state.currentUser?.avatar) {
        state.currentUser.avatar = null;
      }
    },
    setAvatar: (state, action: any) => {
      state.currentUser.avatar = action.payload;
    },
  },
});

export const { setUser, logout, setAvatar, deleteAvatar, setUserLoading } = userSlice.actions;
export default userSlice.reducer;
