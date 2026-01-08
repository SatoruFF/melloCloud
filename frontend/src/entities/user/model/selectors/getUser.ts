import { createSelector } from '@reduxjs/toolkit';
import type { StateSchema } from '../../../../app/store/types/state';

// Base selector
const getUserState = (state: StateSchema) => state.user;

// Simple selectors
export const getUser = createSelector([getUserState], userState => userState.currentUser);

export const getUserAuth = createSelector([getUserState], userState => userState.isAuth);

export const getUserToken = createSelector([getUserState], userState => userState.token);

export const getUserLoading = createSelector([getUserState], userState => userState.isUserLoading);

// Derived selectors
export const getUserRole = createSelector([getUser], user => user?.role);

export const checkIsAdmin = createSelector([getUserRole], role => role === 'ADMIN');

export const checkIsActivated = createSelector([getUser], user => user?.isActivated ?? false);

export const getUserDiskUsage = createSelector([getUser], user => {
  if (!user) return { total: 0, used: 0, percentage: 0 };

  const total = typeof user.diskSpace === 'number' ? user.diskSpace : Number(user.diskSpace) || 0;
  const used = typeof user.usedSpace === 'number' ? user.usedSpace : Number(user.usedSpace) || 0;
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return { total, used, percentage };
});
