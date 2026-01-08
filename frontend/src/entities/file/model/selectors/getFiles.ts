import type { StateSchema } from '../../../../app/store';

// Files data
export const getFilesSelector = (state: StateSchema) => state.files?.files || [];

// Current directory
export const getCurrentFileDirSelector = (state: StateSchema) => state.files?.currentDir ?? null;

// Directory navigation
export const getDirStackSelector = (state: StateSchema) => state.files?.dirStack || [];
export const getPathsSelector = (state: StateSchema) => state.files?.paths || [];

// View mode
export const getFilesViewSelector = (state: StateSchema) => state.files?.view ?? 'list';
export const getCurrentFileViewSelector = (state: StateSchema) => state.files?.view ?? 'list';

// Pagination
export const getFilesLimitSelector = (state: StateSchema) => state.files?.limit ?? 50;
export const getFilesOffsetSelector = (state: StateSchema) => state.files?.offset ?? 0;
export const getFilesHasMoreSelector = (state: StateSchema) => state.files?.hasMore ?? false;

// Loading state
export const getFilesLoadingSelector = (state: StateSchema) => state.files?.loading ?? false;
