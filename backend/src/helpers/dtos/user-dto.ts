export interface IUserModel {
  id: number;
  userName: string;
  email: string;
  diskSpace?: string | number | bigint;
  usedSpace?: string | number | bigint;
  avatar?: string | null;
  role?: string;
  isActivated?: boolean;
  token: string;
  refreshToken: string;
}

export class UserDto {
  user: {
    id: number;
    userName: string;
    email: string;
    diskSpace: any;
    usedSpace: any;
    avatar: string;
    role: string;
    isActivated: boolean;
  };

  token: string;
  refreshToken: string;

  constructor(model: IUserModel) {
    const { id, userName, email, diskSpace, usedSpace, avatar, role, isActivated, token, refreshToken } = model;
    this.user = {
      id,
      userName,
      email,
      diskSpace,
      usedSpace,
      avatar: avatar || '',
      role: role || 'USER',
      isActivated: isActivated || false,
    };
    this.token = token;
    this.refreshToken = refreshToken;
  }
}
