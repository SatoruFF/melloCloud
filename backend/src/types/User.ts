interface IUser {
  id: number;
  userName: string;
  email: string;
  diskSpace: number;
  usedSpace: number;
  avatar: string | null;
  role: "USER" | "ROOT";
}
