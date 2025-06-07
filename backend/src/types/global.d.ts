import type { ApiContext } from "../../src/types/apiContext.js";

declare global {
  namespace Express {
    interface Request {
      context: ApiContext;
    }
  }
}
