import publicRouter from "./public/index.js";
import privateRouter from "./private/index.js";
import { Router } from "express";

export const ApiRoutes = {
  public: publicRouter,
  private: privateRouter,
};

const router = Router();

router.use(ApiRoutes.public);
router.use(ApiRoutes.private);

export default router;
