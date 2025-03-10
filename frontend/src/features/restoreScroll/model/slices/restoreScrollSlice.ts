import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  scroll: {},
};

const restoreScrollSlice = createSlice({
  name: 'restoreSlice',
  initialState,
  reducers: {
    setScrollPosition: (state, action: PayloadAction<{ path: string; position: number }>) => {
      state.scroll[action.payload.path] = action.payload.position;
    },
  },
});

export const { actions: restoreScrollActions } = restoreScrollSlice;
export const { reducer: restoreScrollReducer } = restoreScrollSlice;
