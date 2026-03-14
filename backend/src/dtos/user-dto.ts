export interface IUserModel {
  id: number;
  userName: string | null;
  email: string;
  storageGuid: string;
  diskSpace?: string | number | bigint;
  usedSpace?: string | number | bigint;
  avatar?: string | null;
  role?: string;
  isActivated?: boolean;
  isAdmin?: boolean;
  token: string;
  refreshToken: string;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date | string | null;
}

export class UserDto {
  user: {
    id: number;
    userName: string | null;
    email: string;
    storageGuid?: string;
    diskSpace: string | number | bigint;
    usedSpace: string | number | bigint;
    avatar: string;
    role: string;
    isActivated: boolean;
    isAdmin: boolean;
    subscriptionPlan: string;
    subscriptionExpiresAt: string | null;
  };

  token: string;
  refreshToken: string;

  constructor(model: IUserModel) {
    const {
      id, userName, email, diskSpace, usedSpace, avatar, role,
      isActivated, isAdmin, token, refreshToken,
      subscriptionPlan, subscriptionExpiresAt,
    } = model;
    this.user = {
      id,
      userName,
      email,
      diskSpace: diskSpace ?? "0",
      usedSpace: usedSpace ?? "0",
      avatar: avatar || "",
      role: role || "USER",
      isActivated: isActivated ?? false,
      isAdmin: isAdmin ?? false,
      subscriptionPlan: subscriptionPlan || "FREE",
      subscriptionExpiresAt: subscriptionExpiresAt
        ? (subscriptionExpiresAt instanceof Date
            ? subscriptionExpiresAt.toISOString()
            : String(subscriptionExpiresAt))
        : null,
    };
    this.token = token;
    this.refreshToken = refreshToken;
  }
}
