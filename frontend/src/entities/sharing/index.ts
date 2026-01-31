export { sharingApi } from './model/api/sharingApi';
export { sharingReducer, sharingActions } from './model/slice/sharingSlice';

export {
  useShareResourceMutation,
  useGetResourcePermissionsQuery,
  useLazyGetResourcePermissionsQuery,
  useUpdatePermissionMutation,
  useRevokePermissionMutation,
  useCreatePublicLinkMutation,
  useDeletePublicLinkMutation,
  useGetSharedWithMeQuery,
  useLazyGetSharedWithMeQuery,
  useGetSharedByMeQuery,
  useLazyGetSharedByMeQuery,
  useCheckPermissionQuery,
  useLazyCheckPermissionQuery,
  useAccessPublicResourceQuery,
  useLazyAccessPublicResourceQuery,
  useGetSharingActivityQuery,
  useLazyGetSharingActivityQuery,
  useDownloadPublicFileMutation,
} from './model/api/sharingApi';

export type {
  SharePermission,
  SharedResource,
  ShareResourceRequest,
  UpdatePermissionRequest,
  CreatePublicLinkRequest,
  PublicLinkResponse,
  CheckPermissionResponse,
  AccessPublicResourceResponse,
  ShareActivity,
  SharingState,
} from './model/types/sharing';

export { ResourceType, PermissionLevel, ShareActivityType } from './model/types/sharing';
