export enum ResourceType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  EVENT = 'EVENT',
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  CHAT = 'CHAT',
  COLUMN = 'COLUMN',
  KANBAN_BOARD = 'KANBAN_BOARD',
}

export enum PermissionLevel {
  VIEWER = 'VIEWER',
  COMMENTER = 'COMMENTER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum ShareActivityType {
  SHARED = 'SHARED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ACCESSED = 'ACCESSED',
  DOWNLOADED = 'DOWNLOADED',
  EDITED = 'EDITED',
}

export interface SharePermission {
  id: number;
  resourceType: ResourceType;
  resourceId: number;
  email?: string;
  subjectId?: number;
  subjectType: string;
  permissionLevel: PermissionLevel;
  isPublic: boolean;
  publicToken?: string;
  expiresAt?: string;
  grantedBy?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    userName: string;
    email: string;
    avatar?: string;
  };
  grantedByUser?: {
    id: number;
    userName: string;
    email: string;
  };
}

export interface SharedResource {
  id: number;
  title?: string;
  name?: string;
  content?: string;
  resourceType: ResourceType;
  permission: SharePermission;
  [key: string]: any;
}

export interface ShareResourceRequest {
  resourceType: ResourceType;
  resourceId: number;
  email?: string;
  userId?: number;
  permissionLevel: PermissionLevel;
  expiresAt?: string;
}

export interface UpdatePermissionRequest {
  permissionId: number;
  permissionLevel: PermissionLevel;
}

export interface CreatePublicLinkRequest {
  resourceType: ResourceType;
  resourceId: number;
  permissionLevel?: PermissionLevel;
}

export interface PublicLinkResponse {
  token: string;
  url: string;
}

export interface CheckPermissionResponse {
  hasAccess: boolean;
  permissionLevel: PermissionLevel | null;
  expired?: boolean;
}

export interface AccessPublicResourceResponse {
  resource: any;
  permissionLevel: PermissionLevel;
}

export interface ShareActivity {
  id: number;
  actorId: number;
  actorEmail?: string;
  targetId?: number;
  targetEmail?: string;
  resourceType: ResourceType;
  resourceId: number;
  resourceName?: string;
  activityType: ShareActivityType;
  oldPermission?: PermissionLevel;
  newPermission?: PermissionLevel;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// State для slice
export interface SharingState {
  currentResourcePermissions: SharePermission[];
  sharedWithMe: SharedResource[];
  sharedByMe: SharedResource[];
  isLoading: boolean;
  error?: string;
}
