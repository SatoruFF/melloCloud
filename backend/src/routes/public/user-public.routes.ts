import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import passport from "../../configs/oAuth.js";
import { CLIENT_URL, isProduction, prisma } from "../../configs/config.js";
import { UserController } from "../../controllers/userController.js";
import { generateJwt } from "../../utils/generateJwt.js";
import { handleTelegramAuth } from "../../controllers/telegramAuth.js";

const router = new Hono();

// ========================================
// VALIDATION SCHEMAS
// ========================================
const registerSchema = z.object({
  email: z.string().email('Incorrect email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Incorrect email'),
  password: z.string().min(1, 'Password cannot be empty'),
});

// ========================================
// STANDARD AUTH
// ========================================
router.post(
  '/register',
  zValidator('json', registerSchema),
  UserController.registration
);

router.post(
  '/login',
  zValidator('json', loginSchema),
  UserController.login
);

router.get('/activate', UserController.activate);

// ========================================
// GOOGLE OAUTH
// ========================================
router.get('/google', async (c) => {
  // Passport интеграция с Hono требует обёртки
  // Используем middleware adapter (см. ниже)
  return c.redirect('/api/v1/user/google/auth');
});

router.get('/google/callback', async (c) => {
  try {
    const user = (c as { get: (k: string) => unknown }).get('user') as { id: number };
    const { accessToken, refreshToken } = generateJwt(user.id);

    const userAgent = c.req.header('user-agent') || 'Unknown';
    const ip = c.req.header('x-forwarded-for') || 'Unknown';

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent,
        ip,
      },
    });

    setCookie(c, 'refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
    });

    return c.redirect(`${CLIENT_URL}?token=${accessToken}`);
  } catch (error: any) {
    return c.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
});

// ========================================
// TELEGRAM AUTH
// ========================================
router.get('/telegram/callback', handleTelegramAuth);

// ========================================
// YANDEX OAUTH (аналогично Google)
// ========================================
router.get('/yandex', async (c) => {
  return c.redirect('/api/v1/user/yandex/auth');
});

router.get('/yandex/callback', async (c) => {
  try {
    const user = (c as { get: (k: string) => unknown }).get('user') as { id: number };
    const { accessToken, refreshToken } = generateJwt(user.id);

    const userAgent = c.req.header('user-agent') || 'Unknown';
    const ip = c.req.header('x-forwarded-for') || 'Unknown';

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent,
        ip,
      },
    });

    setCookie(c, 'refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
    });

    return c.redirect(`${CLIENT_URL}?token=${accessToken}`);
  } catch (error: any) {
    return c.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
});

export default router;
