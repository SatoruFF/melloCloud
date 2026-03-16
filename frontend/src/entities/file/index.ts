// Types
export type { FileListSchema, FileProps, IFile } from './types/file';

// Components
export { default as File } from './ui/File';

// Reducer
export {
  default as fileReducer,
  setFiles,
  addFiles,
  setDir,
  addNewFile,
  pushToStack,
  popToStack,
  setView,
  pushToPath,
  popToPath,
  setLimit,
  setOffset,
  setLoading,
  setHasMore
} from './model/slice/fileSlice';

// Selectors
export {
  getCurrentFileDirSelector,
  getFilesHasMoreSelector,
  getFilesLimitSelector,
  getFilesLoadingSelector,
  getFilesOffsetSelector,
  getFilesSelector,
  getFilesViewSelector,
} from './model/selectors/getFiles';

// API Hooks
export {
  useGetFilesQuery,
  useLazyGetFilePreviewUrlQuery,
  useLazyGetFileContentQuery,
  useCreateDirMutation,
  useDownloadFileMutation,
  useDeleteFileMutation,
  useDeleteAvatarMutation,
} from './model/api/fileApi';
