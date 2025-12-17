import { Router } from "express";
import { UserController } from "../../controllers/userController";

const router: Router = Router();

router.post("/register", UserController.registration);

router.post("/login", UserController.login);

router.get("/activate", UserController.activate);

export default router;
