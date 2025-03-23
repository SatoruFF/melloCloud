import { createSlice } from '@reduxjs/toolkit';

export interface fileInterface {
  files: [];
  currentDir: any;
  dirStack: number[] | [];
  view: string;
  paths: any[];
}

const initialState: fileInterface = {
  files: [],
  currentDir: null,
  dirStack: [],
  view: 'list',
  paths: [{ title: 'Root' }],
};

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setDir: (state, action) => {
      state.currentDir = action.payload;
    },
    addNewFile: (state: any, action) => {
      state.files.push(action.payload);
    },
    pushToStack: (state: any, action) => {
      state.dirStack.push(action.payload);
    },
    popToStack: (state: any) => {
      state.currentDir = state.dirStack.pop();
    },
    pushToPath: (state: any, action) => {
      state.paths.push(action.payload);
    },
    popToPath: (state: any) => {
      state.paths.pop();
    },
    setView: (state: any, action) => {
      state.view = action.payload;
    },
  },
});

export const { setFiles, setDir, addNewFile, pushToStack, popToStack, setView, pushToPath, popToPath } =
  fileSlice.actions;
export default fileSlice.reducer;
