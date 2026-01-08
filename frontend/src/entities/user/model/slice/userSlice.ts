import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser, UserSchema } from '../types/user';

interface SetUserPayload {
  user: IUser;
  token: string;
}

const initialState: UserSchema = {
  currentUser: null,
  token: null,
  isAuth: false,
  isUserLoading: true,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SetUserPayload>) => {
      const { user, token } = action.payload;
      state.currentUser = user;
      state.token = token;
      state.isAuth = true;
      state.isUserLoading = false;
      localStorage.setItem('token', token);
    },
    logout: state => {
      state.isAuth = false;
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isUserLoading = action.payload;
    },
    deleteAvatar: state => {
      if (state.currentUser) {
        state.currentUser.avatar = null;
      }
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.avatar = action.payload;
      }
    },
    updateUserInfo: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
  },
});

export const { setUser, logout, setAvatar, deleteAvatar, setUserLoading, updateUserInfo } = userSlice.actions;

export const { reducer: userReducer } = userSlice;
export default userSlice.reducer;
