import type { ApiContext } from "../../src/types/apiContext.js";

declare global {
  namespace Express {
    interface User {
      id?: number;
    }
    interface Request {
      context: ApiContext;
    }
  }
}
