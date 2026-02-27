// @ts-nocheck
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { message } from 'antd';
import { Variables } from '../../../../shared';
import i18n from '../../../../shared/config/i18n/i18n';
import { logout, setUser, setUserLoading } from '../slice/userSlice';

const mutex = new Mutex();

interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface Session {
  id: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastActivity: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: Variables.BASE_API_URL,
  // Отправляем httpOnly cookies (accessToken / refreshToken) вместе с запросами
  credentials: "include",
  prepareHeaders: headers => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// If we get 401 status => refresh access token
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          {
            url: '/user/refresh',
            method: 'GET',
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          api.dispatch(setUser(refreshResult.data as any));
          // Retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        api.dispatch(setUserLoading());
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  if (result.error && result.error.status === 403) {
    const data = (result.error as any)?.data;
    if (data?.code === 'USER_BLOCKED') {
      api.dispatch(logout());
      window.location.href = '/access-denied';
    }
  }

  if (result.error && result.error.status === 429) {
    message.warning(i18n.t('common.tooManyRequests'));
  }

  return result;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User', 'Sessions'],
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    // Authentication endpoints
    registration: builder.mutation<any, RegisterRequest>({
      query: body => ({
        url: Variables.Auth_Register,
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<any, LoginRequest>({
      query: body => ({
        url: Variables.Auth_Login,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sessions'],
    }),

    activateUser: builder.mutation<any, string>({
      query: token => ({
        url: `${Variables.Auth_Activate}?token=${token}`,
        method: 'GET',
      }),
    }),

    auth: builder.query<any, void>({
      query: () => Variables.User_Auth,
      providesTags: ['User'],
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: Variables.User_Logout,
        method: 'POST',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // Session management endpoints

    // Logout from all devices
    logoutAll: builder.mutation<any, void>({
      query: () => ({
        url: Variables.User_LogoutAll,
        method: 'POST',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // Get list of active sessions
    getSessions: builder.query<Session[], void>({
      query: () => Variables.User_Sessions,
      providesTags: ['Sessions'],
    }),

    // Delete specific session
    deleteSession: builder.mutation<any, string>({
      query: sessionId => ({
        url: `${Variables.User_Sessions}/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // User profile endpoints
    changeInfo: builder.mutation<any, { userName?: string }>({
      query: body => ({
        url: Variables.User_ChangeInfo,
        method: 'PATCH',
        body,
      }),
    }),

    changePassword: builder.mutation<
      { success: boolean },
      { currentPassword: string; newPassword: string }
    >({
      query: body => ({
        url: Variables.User_ChangePassword,
        method: 'PATCH',
        body,
      }),
    }),

    deleteAccount: builder.mutation<{ success: boolean }, { password: string }>({
      query: body => ({
        url: Variables.User_DeleteAccount,
        method: 'DELETE',
        body,
      }),
    }),

    searchUsers: builder.query<any[], string>({
      query: query => `${Variables.User_Search}?query=${query}`,
    }),
  }),
});

export const {
  useRegistrationMutation,
  useLoginMutation,
  useAuthQuery,
  useChangeInfoMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useActivateUserMutation,
  useSearchUsersQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useDeleteSessionMutation,
} = userApi;
