import { createSelector } from '@reduxjs/toolkit';
import { StateSchema } from '../../../../app/store/types/state';

export const getUserRoles = (state: StateSchema) => state.user?.roles;

export const checkIsAdmin = createSelector(getUserRoles, roles => Boolean(roles?.includes('admin')));
