import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { Variables } from '../../../../shared/consts/localVariables';
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

// Base query with parameters to auth with access token
const baseQuery = fetchBaseQuery({
  baseUrl: Variables.BASE_API_URL,
  // credentials: "include", // ВАЖНО: для работы с cookies
  prepareHeaders: headers => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// if we get 401 status => rewrite access token
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
          // retry the initial query
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

  return result;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User', 'Sessions'],
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    // ========================================
    // СТАНДАРТНАЯ АВТОРИЗАЦИЯ
    // ========================================
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
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: Variables.User_Logout,
        method: 'POST',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // ========================================
    // НОВОЕ: УПРАВЛЕНИЕ СЕССИЯМИ
    // ========================================

    // Выйти со всех устройств
    logoutAll: builder.mutation<any, void>({
      query: () => ({
        url: Variables.User_LogoutAll,
        method: 'POST',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // Получить список активных сессий
    getSessions: builder.query<Session[], void>({
      query: () => Variables.User_Sessions,
      providesTags: ['Sessions'],
    }),

    // Удалить конкретную сессию
    deleteSession: builder.mutation<any, string>({
      query: sessionId => ({
        url: `${Variables.User_Sessions}/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // ========================================
    // ДРУГИЕ МЕТОДЫ
    // ========================================

    changeInfo: builder.mutation<any, any>({
      query: body => ({
        url: Variables.User_ChangeInfo,
        method: 'PATCH',
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
  useActivateUserMutation,
  useSearchUsersQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useDeleteSessionMutation,
} = userApi;
