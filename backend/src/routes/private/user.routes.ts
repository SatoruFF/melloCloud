import { Router } from "express";
import { check } from "express-validator";
import { UserController } from "../../controllers/userController";

const router: Router = Router();

// AUTH ROUTES
router.get("/auth", UserController.auth);

router.get("/refresh", UserController.refresh);

router.post("/logout", UserController.logout);

// ANOTHER ROUTES

router.patch("/changeinfo", [check("email", "Uncorrect email").isEmail()], UserController.changeInfo);

router.get("/search", UserController.search);

router.get("/:id", UserController.getById);

// router.get('/activate/:link', UserController.activate)

export default router;
