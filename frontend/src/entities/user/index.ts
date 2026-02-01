// Types
export type { IUser, UserSchema, UserRolesType } from './model/types/user';

// API
export { userApi } from './model/api/user';
export {
  useAuthQuery,
  useLoginMutation,
  useRegistrationMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useDeleteSessionMutation,
  useChangeInfoMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useActivateUserMutation,
  useSearchUsersQuery,
} from './model/api/user';

// Reducer
export { default as userReducer } from './model/slice/userSlice';

// Actions
export {
  setUser,
  logout,
  setAvatar,
  deleteAvatar,
  setUserLoading,
  updateUserInfo,
} from './model/slice/userSlice';

// Selectors
export {
  getUser as getUserSelector,
  getUserAuth as getUserAuthSelector,
  getUserToken as getUserTokenSelector,
  getUserRole as getUserRoleSelector,
  getUserLoading as getUserLoadingSelector,
  checkIsAdmin,
  checkIsActivated,
  getUserDiskUsage,
} from './model/selectors/getUser';
