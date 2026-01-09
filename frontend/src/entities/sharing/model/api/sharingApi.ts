import { rtkApi } from '../../../../shared/api/rtkApi';
import { ApiPaths } from '../../../../shared';
import type {
  SharePermission,
  SharedResource,
  ShareResourceRequest,
  UpdatePermissionRequest,
  CreatePublicLinkRequest,
  PublicLinkResponse,
  CheckPermissionResponse,
  AccessPublicResourceResponse,
  ShareActivity,
  ResourceType,
} from '../types/sharing';

export const sharingApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Share resource with user
    shareResource: builder.mutation<SharePermission, ShareResourceRequest>({
      query: body => ({
        url: ApiPaths.sharing,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Get permissions for resource
    getResourcePermissions: builder.query<
      SharePermission[],
      {
        resourceType: ResourceType;
        resourceId: number;
      }
    >({
      query: ({ resourceType, resourceId }) => `${ApiPaths.sharingPermissions}/${resourceType}/${resourceId}`,
      providesTags: ['Permissions'],
    }),

    // Update permission level
    updatePermission: builder.mutation<SharePermission, UpdatePermissionRequest>({
      query: ({ permissionId, permissionLevel }) => ({
        url: `${ApiPaths.sharingPermissions}/${permissionId}`,
        method: 'PATCH',
        body: { permissionLevel },
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Revoke permission
    revokePermission: builder.mutation<{ message: string }, number>({
      query: permissionId => ({
        url: `${ApiPaths.sharingPermissions}/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Create public link
    createPublicLink: builder.mutation<PublicLinkResponse, CreatePublicLinkRequest>({
      query: body => ({
        url: ApiPaths.sharingPublicLink,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Delete public link
    deletePublicLink: builder.mutation<
      { message: string },
      {
        resourceType: ResourceType;
        resourceId: number;
      }
    >({
      query: ({ resourceType, resourceId }) => ({
        url: `${ApiPaths.sharingPublicLink}/${resourceType}/${resourceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Get resources shared with me
    getSharedWithMe: builder.query<SharedResource[], ResourceType | undefined>({
      query: type => ({
        url: ApiPaths.sharingSharedWithMe,
        params: type ? { type } : {},
      }),
    }),

    // Get resources shared by me
    getSharedByMe: builder.query<SharedResource[], ResourceType | undefined>({
      query: type => ({
        url: ApiPaths.sharingSharedByMe,
        params: type ? { type } : {},
      }),
    }),

    // Check user permission
    checkPermission: builder.query<
      CheckPermissionResponse,
      {
        resourceType: ResourceType;
        resourceId: number;
      }
    >({
      query: ({ resourceType, resourceId }) => `${ApiPaths.sharingCheckPermission}/${resourceType}/${resourceId}`,
    }),

    // Access public resource
    accessPublicResource: builder.query<AccessPublicResourceResponse, string>({
      query: token => `${ApiPaths.sharingPublic}/${token}`,
    }),

    // Get sharing activity
    getSharingActivity: builder.query<
      ShareActivity[],
      {
        resourceType: ResourceType;
        resourceId: number;
      }
    >({
      query: ({ resourceType, resourceId }) => `${ApiPaths.sharingActivity}/${resourceType}/${resourceId}`,
    }),

    downloadPublicFile: builder.mutation<Blob, string>({
      query: token => ({
        url: `${ApiPaths.sharingPublic}/${token}/download`,
        method: 'GET',
        responseHandler: response => response.blob(),
      }),
    }),
  }),
});

export const {
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
} = sharingApi;
