import _ from "lodash";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import createError from "http-errors";
import { isProduction } from "../configs/config.js";
import { logger } from "../configs/logger.js";
import { UserService } from "../services/userService.js";
import ApiContext from "../models/context.js";

class UserControllerClass {
  // Регистрация пользователя
  async registration(c: Context) {
    try {
      const body = await c.req.json<{ userName: string; email: string; password: string }>();
      const { userName, email, password } = body;

      const invite = await UserService.createInvite({ userName, email, password });
      return c.json(invite);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Логин пользователя
  async login(c: Context) {
    try {
      const body = await c.req.json<{ email: string; password: string }>();
      const { email, password } = body;

      const userAgent = c.req.header("user-agent") || "Unknown";
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "Unknown";

      const userData = await UserService.login(email, password, { userAgent, ip });

      // Устанавливаем accessToken в httpOnly cookie (защита от XSS)
      setCookie(c, "accessToken", userData.accessToken, {
        maxAge: 60 * 60, // 1 час
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        path: "/",
      });

      // Устанавливаем refreshToken в httpOnly cookie
      setCookie(c, "refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 дней
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        path: "/",
      });

      // Возвращаем данные БЕЗ токенов (они уже в cookies)
      return c.json(_.omit(userData, ["accessToken", "refreshToken"]));
    } catch (error: any) {
      logger.error(error.message, error);
      if (error.statusCode === 403 && error.message === "USER_BLOCKED") {
        return c.json(
          {
            message:
              "Unfortunately, access to the system has been restricted for your account. If you believe this is an error, please contact the administrator.",
            code: "USER_BLOCKED",
          },
          403
        );
      }
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Проверка авторизации по access токену
  async auth(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const id = user?.id;

      if (!id) {
        throw createError(401, "User not found");
      }

      const userData = await UserService.auth(id);
      return c.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      if (error.statusCode === 403 && error.message === "USER_BLOCKED") {
        return c.json(
          {
            message:
              "Unfortunately, access to the system has been restricted for your account. If you believe this is an error, please contact the administrator.",
            code: "USER_BLOCKED",
          },
          403
        );
      }
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Активация по ссылке
  async activate(c: Context) {
    try {
      const queries = c.req.query();
      const params = c.req.param();
      const activationToken = (queries.token as string | undefined) ?? (params.token as string | undefined);

      if (!activationToken) {
        throw createError(404, "Cannot get activate token");
      }

      const userAgent = c.req.header("user-agent") || "Unknown";
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "Unknown";

      const userData = await UserService.activate(activationToken, { userAgent, ip });

      setCookie(c, "refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
      });

      return c.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Обновление access токена по refresh
  async refresh(c: Context) {
    try {
      const refreshToken = getCookie(c, "refreshToken");

      const userData = await UserService.refresh(refreshToken);

      // Обновляем accessToken cookie
      setCookie(c, "accessToken", userData.accessToken, {
        maxAge: 60 * 60, // 1 час
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        path: "/",
      });

      // Обновляем refreshToken cookie
      setCookie(c, "refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 дней
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        path: "/",
      });

      // Возвращаем данные БЕЗ токенов
      return c.json(_.omit(userData, ["accessToken", "refreshToken"]));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Выход из текущей сессии
  async logout(c: Context) {
    try {
      const refreshToken = getCookie(c, "refreshToken");
      const user = c.get("user") as { id?: number } | undefined;
      const id = user?.id;

      const loggedOutUser = await UserService.logout(id, refreshToken);

      // Удаляем оба cookie
      deleteCookie(c, "accessToken", { path: "/" });
      deleteCookie(c, "refreshToken", { path: "/" });

      return c.json(
        {
          message: `User ${loggedOutUser?.email} was successfully logged out`,
        },
        200,
      );
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Выйти из всех сессий
  async logoutAll(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const id = user?.id;

      const loggedOutUser = await UserService.logoutAll(id);

      // Удаляем оба cookie
      deleteCookie(c, "accessToken", { path: "/" });
      deleteCookie(c, "refreshToken", { path: "/" });

      return c.json(
        {
          message: `All sessions for user ${loggedOutUser?.email} were terminated`,
        },
        200,
      );
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Получить все активные сессии пользователя
  async getSessions(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const id = user?.id;

      const sessions = await UserService.getSessions(id);
      return c.json(sessions);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Удалить конкретную сессию
  async deleteSession(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const id = user?.id;
      const { sessionId } = c.req.param();

      await UserService.deleteSession(id, sessionId);
      return c.json({ message: "Session deleted successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Поиск пользователей
  async search(c: Context) {
    try {
      const query = c.req.query("query")?.toString().toLowerCase();
      if (!query) {
        throw createError(400, "Empty query");
      }

      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const users = await UserService.search(apiContext, query);
      return c.json(users);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Получить пользователя по id
  async getById(c: Context) {
    try {
      const { id } = c.req.param();
      if (!id) {
        throw createError(400, "Empty Params");
      }

      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const user = await UserService.getById(apiContext, Number(id));
      if (!user) {
        throw createError(404, "User not found");
      }

      return c.json(user);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async changeInfo(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) throw createError(401, "User not found");
      const body = await c.req.json<{ userName?: string }>();
      const updated = await UserService.updateUserInfo(userId, body);
      return c.json(updated);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async changePassword(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) throw createError(401, "User not found");
      const body = await c.req.json<{ currentPassword: string; newPassword: string }>();
      const result = await UserService.changePassword(userId, body.currentPassword, body.newPassword);
      return c.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async deleteAccount(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) throw createError(401, "User not found");
      const body = await c.req.json<{ password: string }>();
      const result = await UserService.deleteAccount(userId, body.password);
      return c.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const UserController = new UserControllerClass();
