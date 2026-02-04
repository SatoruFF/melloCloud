import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { message } from 'antd';
import { logout } from '../../entities/user/model/slice/userSlice';
import i18n from '../config/i18n/i18n';
import { Variables } from '../consts/localVariables';

const url = Variables.BASE_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: url,
  prepareHeaders: headers => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithBlockedCheck: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 403) {
    const data = (result.error as any)?.data;
    if (data?.code === 'USER_BLOCKED') {
      api.dispatch(logout());
      window.location.href = '/access-denied';
    }
  }
  if (result.error && result.error.status === 429) {
    // is this work?
    message.warning(i18n.t('common.tooManyRequests'));
  }
  return result;
};

export const rtkApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithBlockedCheck,
  tagTypes: ['Notes', 'Permissions', 'Kanban', 'Board', 'Notification', 'AdminUsers', 'AdminFiles', 'AdminNotes', 'AdminInvites', 'AdminSessions', 'AdminTasks', 'AdminEvents', 'AdminBoards', 'AdminFeatureFlags'],
  endpoints: () => ({}),
});
