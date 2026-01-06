import authMiddle from "./auth.middleware.js";

export const publicMiddlewares = [];
export const privateMiddlewares = [authMiddle];
