export type UserRolesType = 'ADMIN' | 'USER';

export interface IUser {
  id: number;
  userName: string | null;
  email: string;
  diskSpace?: string | number;
  usedSpace?: string | number;
  avatar?: string | null;
  role: string; // "ADMIN" or "USER" from Prisma
  isActivated: boolean;
  oauthProvider?: string | null;
  oauthId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSchema {
  currentUser?: IUser | null;
  token: string | null;
  isAuth: boolean;
  isUserLoading: boolean;
}

// TODO: future
export enum ResourceType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  EVENT = 'EVENT',
  FILE = 'FILE',
  CHAT = 'CHAT',
  COLUMN = 'COLUMN',
}

export enum PermissionLevel {
  AVAILABLE = 2,
  SEARCH = 8,
  READ = 32,
  EDIT = 128,
  CREATE = 512,
  EXPORT = 1024,
  DELETE = 2048,
  ACCESS = 8192,
  ADMIN = 32768,
  DENY = 131072,
}

export interface IPermission {
  id: number;
  subjectId: number;
  subjectType: string;
  resourceId: number;
  resourceType: ResourceType;
  level: number;
  grantedBy?: number | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Хелпер для проверки прав
export const hasPermission = (userPermissions: number, required: PermissionLevel): boolean => {
  return (userPermissions & required) === required;
};
