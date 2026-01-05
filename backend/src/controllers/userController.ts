import _ from "lodash";
import "dotenv/config.js";
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { UserService } from "../services/userService.js";

class UserControllerClass {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { userName, email, password } = req.body;
      const invite = await UserService.createInvite({ userName, email, password });
      return res.json(invite);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers["user-agent"];
      const ip = req.ip || req.connection.remoteAddress;

      const userData = await UserService.login(email, password, { userAgent, ip });

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async auth(req: any, res: Response) {
    try {
      const id = req.user?.id;
      if (!id) {
        throw createError(401, "User not found");
      }

      const userData = await UserService.auth(id);
      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async activate(req: any, res: Response) {
    try {
      const { token: activationToken } = req.query || req.params;
      if (!activationToken) throw createError(404, "Cannot get activate token");

      const userAgent = req.headers["user-agent"];
      const ip = req.ip || req.connection.remoteAddress;

      const userData = await UserService.activate(activationToken, { userAgent, ip });

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async refresh(req: any, res: Response) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async logout(req: any, res: Response) {
    try {
      const { refreshToken } = req.cookies;
      const id = req.user?.id;

      const user = await UserService.logout(id, refreshToken);
      res.clearCookie("refreshToken");

      return res.status(200).json({
        message: `User ${user?.email} was successfully logged out`,
      });
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  // Выйти из всех сессий
  async logoutAll(req: any, res: Response) {
    try {
      const id = req.user?.id;
      const user = await UserService.logoutAll(id);
      res.clearCookie("refreshToken");

      return res.status(200).json({
        message: `All sessions for user ${user?.email} were terminated`,
      });
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  // Получить все активные сессии пользователя
  async getSessions(req: any, res: Response) {
    try {
      const id = req.user?.id;
      const sessions = await UserService.getSessions(id);
      return res.json(sessions);
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  // Удалить конкретную сессию
  async deleteSession(req: any, res: Response) {
    try {
      const id = req.user?.id;
      const { sessionId } = req.params;

      await UserService.deleteSession(id, sessionId);
      return res.json({ message: "Session deleted successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async search(req: any, res: Response) {
    try {
      const query = req.query.query?.toString().toLowerCase();
      if (!query) throw createError(400, "Empty query");

      const users = await UserService.search(req.context, query);
      return res.json(users);
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async getById(req: any, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw createError(400, "Empty Params");

      const user = await UserService.getById(req.context, Number(id));
      if (!user) throw createError(404, "User not found");

      return res.json(user);
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async changeInfo(req: Request, res: Response) {
    // Implementation here
  }
}

export const UserController = new UserControllerClass();
