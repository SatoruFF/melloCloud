import { Router } from "express";
import { check } from "express-validator";
import passport from "../../configs/oAuth.js";
import { prisma } from "../../configs/config.js";
import { UserController } from "../../controllers/userController.js";
import { generateJwt } from "../../utils/generateJwt.js";
import { handleTelegramAuth } from "../../controllers/telegramAuth.js";

const router: Router = Router();

// ========================================
// СТАНДАРТНАЯ АВТОРИЗАЦИЯ
// ========================================

router.post(
  "/register",
  [
    check("email", "Incorrect email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  UserController.registration
);

router.post(
  "/login",
  [check("email", "Incorrect email").isEmail(), check("password", "Password cannot be empty").exists()],
  UserController.login
);

router.get("/activate", UserController.activate);

// ========================================
// GOOGLE OAUTH
// ========================================

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req: any, res) => {
    try {
      const user = req.user;
      const { accessToken, refreshToken } = generateJwt(user.id);

      const userAgent = req.headers["user-agent"] || "Unknown";
      const ip = req.ip || req.connection.remoteAddress || "Unknown";

      // Создаем сессию
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent,
          ip,
        },
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}?token=${accessToken}`);
    } catch (error: any) {
      console.error("Google OAuth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

// ========================================
// TELEGRAM AUTH (использует Login Widget, не OAuth2)
// ========================================

router.get("/telegram/callback", handleTelegramAuth);

// ========================================
// YANDEX OAUTH
// ========================================

router.get("/yandex", passport.authenticate("yandex", { session: false }));

router.get(
  "/yandex/callback",
  passport.authenticate("yandex", { session: false, failureRedirect: "/login" }),
  async (req: any, res) => {
    try {
      const user = req.user;
      const { accessToken, refreshToken } = generateJwt(user.id);

      const userAgent = req.headers["user-agent"] || "Unknown";
      const ip = req.ip || req.connection.remoteAddress || "Unknown";

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent,
          ip,
        },
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.redirect(`${process.env.CLIENT_URL}?token=${accessToken}`);
    } catch (error: any) {
      console.error("Yandex OAuth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

export default router;
