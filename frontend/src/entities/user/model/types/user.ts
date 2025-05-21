export type UserRolesType = "admin" | "user";

export interface IUser {
  id: number;
  userName: string;
  email: string;
  diskSpace?: string | number;
  usedSpace?: string | number;
  avatar?: string | null;
  role?: string;
  isActivated?: boolean;
  roles: UserRolesType[]; // ?
}

export interface UserSchema {
  currentUser?: IUser | {};
  token: string | null;
  isAuth: boolean;
  isUserLoading: boolean;
}
