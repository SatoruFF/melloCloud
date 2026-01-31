import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SharingState, SharePermission, SharedResource } from '../types/sharing';

const initialState: SharingState = {
  currentResourcePermissions: [],
  sharedWithMe: [],
  sharedByMe: [],
  isLoading: false,
  error: undefined,
};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    setCurrentResourcePermissions: (state, action: PayloadAction<SharePermission[]>) => {
      state.currentResourcePermissions = action.payload;
    },
    setSharedWithMe: (state, action: PayloadAction<SharedResource[]>) => {
      state.sharedWithMe = action.payload;
    },
    setSharedByMe: (state, action: PayloadAction<SharedResource[]>) => {
      state.sharedByMe = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    clearSharingState: state => {
      state.currentResourcePermissions = [];
      state.sharedWithMe = [];
      state.sharedByMe = [];
      state.error = undefined;
    },
  },
});

export const { actions: sharingActions, reducer: sharingReducer } = sharingSlice;
