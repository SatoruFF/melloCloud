import {
  getFilesHasMoreSelector,
  getFilesLimitSelector,
  getFilesLoadingSelector,
  getFilesOffsetSelector,
  getFilesSelector,
  getFilesViewSelector,
} from './model/selectors/getFiles';
import type { FileListSchema, FileProps, IFile } from './types/file';
import File from './ui/File';
import fileReducer from './model/slice/fileSlice';

export {
  File,
  type FileListSchema,
  type IFile,
  type FileProps,
  getFilesSelector,
  getFilesViewSelector,
  getFilesLimitSelector,
  getFilesOffsetSelector,
  getFilesLoadingSelector,
  getFilesHasMoreSelector,
  fileReducer,
};
