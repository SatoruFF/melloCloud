import { createSelector } from '@reduxjs/toolkit';
import { StateSchema } from '../../../../app/store/types/state';

export const getScroll = (state: StateSchema) => state.ui.scroll;
export const getScrollByPath = createSelector(
  // memoized reselect
  getScroll,
  (state: StateSchema, path: string) => path,
  (scroll, path) => scroll[path] || 0,
);
