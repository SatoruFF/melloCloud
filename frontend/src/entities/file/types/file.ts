export interface IFile {
  id: string;
  name: string;
  type: 'dir' | 'file';
  size: number;
  url?: string;
  updatedAt?: string;
  isShared?: boolean;
  publicToken?: string;
}

export interface FileListSchema {
  files: IFile[];
  currentDir: string | null;
  dirStack: (string | null)[];
  view: string;
  paths: { title: string }[];
  limit: number;
  offset: number;
  hasMore: boolean;
  loading: boolean;
}

export interface FileProps {
  file: IFile;
}
