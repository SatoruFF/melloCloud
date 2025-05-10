import { StateSchema } from './../../../../app/store/types/state';

export const getUser = (state: StateSchema) => state.user.currentUser;
