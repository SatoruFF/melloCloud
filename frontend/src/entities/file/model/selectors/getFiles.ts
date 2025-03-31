import type { StateSchema } from "../../../../app/store/types/state";

export const getFilesSelector = (state: StateSchema) =>
	state.files?.files || [];
export const getFilesViewSelector = (state: StateSchema) => state.files?.view;
export const getFilesLimitSelector = (state: StateSchema) =>
	state.files?.limit ?? 50;
export const getFilesOffsetSelector = (state: StateSchema) =>
	state.files?.offset ?? 0;
export const getFilesLoadingSelector = (state: StateSchema) =>
	state.files?.loading ?? false;
export const getFilesHasMoreSelector = (state: StateSchema) =>
	state.files?.hasMore ?? false;
