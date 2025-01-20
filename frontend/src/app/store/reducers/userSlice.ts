import { createSlice } from '@reduxjs/toolkit';

export interface UserInterface {
  currentUser: any;
  token: string | null;
  isAuth: boolean;
}

const initialState: UserInterface = {
  currentUser: {},
  token: '',
  isAuth: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: any) => {
      if (action.payload && action.payload.user) {
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isAuth = true;
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: state => {
      state.isAuth = false;
      state.currentUser = {};
      state.token = null;
      localStorage.removeItem('token');
    },
    deleteAvatar: state => {
      state.currentUser.avatar = null;
    },
    setAvatar: (state, action: any) => {
      state.currentUser.avatar = action.payload;
    },
  },
});

export const { setUser, logout, setAvatar, deleteAvatar } = userSlice.actions;
export default userSlice.reducer;
