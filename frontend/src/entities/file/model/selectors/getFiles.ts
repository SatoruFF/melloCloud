import { StateSchema } from '../../../../app/store/types/state';

export const getFilesSelector = (state: StateSchema) => state.files.files;
