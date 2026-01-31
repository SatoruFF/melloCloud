import crypto from "crypto";
import type { Context } from "hono";
import { prisma } from "../configs/config.js";
import { v4 as uuidv4 } from "uuid";
import { generateJwt } from "../utils/generateJwt.js";
import { FileService } from "../services/fileService.js";

/**
 * Telegram Login Widget использует другой подход чем OAuth2
 * Документация: https://core.telegram.org/widgets/login
 */

interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Проверяет подлинность данных от Telegram
 */
function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...rest } = data;

  // Создаем строку для проверки
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .join("\n");

  // Генерируем secret key
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  // Генерируем hash для сравнения
  const computedHash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

  return computedHash === hash;
}

/**
 * Обработчик для Telegram Login Widget callback
 */
export async function handleTelegramAuth(c: Context) {
  try {
    const query = c.req.query();
    const telegramData = query as unknown as TelegramAuthData;

    // Проверяем наличие обязательных полей
    if (!telegramData.id || !telegramData.hash || !telegramData.auth_date) {
      return c.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Invalid Telegram data")}`);
    }

    // Проверяем подлинность данных
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return c.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Telegram auth not configured")}`);
    }

    const isValid = verifyTelegramAuth(telegramData, botToken);
    if (!isValid) {
      return c.redirect(
        `${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Invalid Telegram authentication")}`,
      );
    }

    // Проверяем срок действия (не старше 1 дня)
    const authDate = new Date(telegramData.auth_date * 1000);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    if (now.getTime() - authDate.getTime() > dayInMs) {
      return c.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Telegram auth expired")}`);
    }

    // Ищем или создаем пользователя
    const telegramId = telegramData.id.toString();
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: "telegram",
        oauthId: telegramId,
      },
    });

    if (!user) {
      const storageGuid = uuidv4();
      const email = `${telegramId}@telegram.local`; // Telegram не предоставляет email
      const userName =
        telegramData.username ||
        `${telegramData.first_name || "User"}_${telegramData.last_name || ""}`.trim() ||
        `telegram_${telegramId}`;

      user = await prisma.user.create({
        data: {
          email,
          userName,
          password: "",
          storageGuid,
          isActivated: true,
          oauthProvider: "telegram",
          oauthId: telegramId,
          avatar: telegramData.photo_url,
        },
      });

      // Создаем конфигурацию пользователя
      await prisma.userConfig.create({
        data: { userId: user.id },
      });

      // Создаем базовую директорию
      const baseDir = {
        userId: user.id,
        path: "",
        type: "dir",
        name: "",
        storageGuid,
      };
      await FileService.createDir(baseDir);
    }

    // Генерируем токены
    const { accessToken, refreshToken } = generateJwt(user.id);

    // Получаем метаданные запроса
    const userAgent = c.req.header("user-agent") || "Unknown";
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "Unknown";

    // Создаем сессию
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent,
        ip,
      },
    });

    // Устанавливаем cookie
    c.cookie("refreshToken", refreshToken, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    // Редиректим на фронтенд с токеном
    return c.redirect(`${process.env.CLIENT_URL}?token=${accessToken}`);
  } catch (error: any) {
    console.error("Telegram auth error:", error);
    return c.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message || "Telegram auth failed")}`,
    );
  }
}
