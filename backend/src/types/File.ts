export interface IFile {
  userId: number;
  path: string;
  storageGuid: string;
  parentId?: null | number;
  name?: string;
  type: string | "dir" | "file";
  url?: string;
}

export interface ISearchParams {
  userId: number;
  storageGuid?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
  parentId?: number;
}
