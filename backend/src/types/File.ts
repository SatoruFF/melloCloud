export interface IFile {
  userId: number;
  path: string;
  name?: string;
  type: string | 'dir' | 'file';
  url?: string;
}

export interface ISearchParams {
  userId: number;
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
  parentId?: number;
}
