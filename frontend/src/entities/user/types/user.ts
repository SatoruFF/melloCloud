export interface UserSchema {
  currentUser: any;
  token: string | null;
  isAuth: boolean;
  isUserLoading: boolean;
}
