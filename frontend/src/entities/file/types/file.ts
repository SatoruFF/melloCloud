export interface FileListSchema {
  // why this here???
  files: IFile[];
  currentDir: any;
  dirStack: number[] | [];
  view: string;
  paths: any[];
  limit: number;
  offset: number;
  hasMore: boolean;
  loading: boolean;
}

export interface IFile {
  id: string;
  name: string;
  type: 'dir' | 'file';
  size: number;
  url?: string;
  updatedAt?: string;
}

export interface FileProps {
  file: IFile;
}
