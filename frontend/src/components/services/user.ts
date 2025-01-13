import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

import { Variables } from '../../config/localVariables';
import { logout, setUser } from '../../store/reducers/userSlice';

// create a new mutex
const mutex = new Mutex();

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Base query with parameters to auth with access token
const baseQuery = fetchBaseQuery({
  baseUrl: Variables.User_URL,
  // credentials: 'include', // option that put cookies in query(?)
  credentials: 'same-origin',
  prepareHeaders: (headers, { getState }) => {
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
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await baseQuery(
          {
            url: 'refresh',
            method: 'get',
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
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    registration: builder.mutation<any, RegisterRequest>({
      query: (body) => ({
        url: 'register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<any, LoginRequest>({
      query: (body) => ({
        url: 'login',
        method: 'POST',
        body,
      }),
    }),
    activateUser: builder.mutation<any, string>({
      query: (token) => ({
        url: `activate?token=${token}`,
        method: 'GET',
      }),
    }),
    auth: builder.query<any, void>({
      query: () => 'auth',
    }),
    logout: builder.mutation<any, any>({
      query: (body) => ({
        url: 'logout',
        method: 'POST',
        body,
      }),
    }),
    changeInfo: builder.mutation<any, any>({
      query: (body) => ({
        url: 'userchange',
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const { useAuthQuery, useChangeInfoMutation, useActivateUserMutation } = userApi;
