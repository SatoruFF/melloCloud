import authMiddle from "./auth.middleware";

export const publicMiddlewares = [];
export const privateMiddlewares = [authMiddle];
