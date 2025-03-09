import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  scroll: {},
};

const restoreScrollSice = createSlice({
  name: 'restoreSlice',
  initialState,
  reducers: {
    setScrollPosition: (state, action: PayloadAction<{ path: string; position: number }>) => {
      state.scroll[action.payload.path] = action.payload.position;
    },
  },
});

export const { actions: restoreScrollActions } = restoreScrollSice;
export const { reducer: restoreScrollReducer } = restoreScrollSice;
