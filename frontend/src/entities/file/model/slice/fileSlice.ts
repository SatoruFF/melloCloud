import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { FileListSchema, IFile } from '../../types/file';

const initialState: FileListSchema = {
  files: [],
  currentDir: null,
  dirStack: [],
  view: 'list',
  paths: [{ title: 'Root' }],
  limit: 50,
  offset: 0,
  hasMore: false,
  loading: false,
};

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<IFile[]>) => {
      state.files = action.payload;
    },
    addFiles: (state, action: PayloadAction<IFile[]>) => {
      if (action?.payload) {
        state.files.push(...action.payload);
      }
    },
    setDir: (state, action: PayloadAction<any>) => {
      state.currentDir = action.payload;
    },
    addNewFile: (state, action: PayloadAction<IFile>) => {
      state.files.push(action.payload);
    },
    pushToStack: (state, action: PayloadAction<string>) => {
      state.dirStack.push(action.payload);
    },
    popToStack: state => {
      const dir = state.dirStack.pop();
      if (dir !== undefined) {
        state.currentDir = String(dir); // FIXME
      }
    },
    pushToPath: (state, action: PayloadAction<any>) => {
      state.paths.push(action.payload);
    },
    popToPath: state => {
      state.paths.pop();
    },
    setView: (state, action: PayloadAction<string>) => {
      state.view = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
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
  setHasMore,
} = fileSlice.actions;

export const fileReducer = fileSlice.reducer;
export default fileSlice.reducer;
