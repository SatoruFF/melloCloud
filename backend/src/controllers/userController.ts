import _ from "lodash";
import "dotenv/config.js";
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { UserService } from "../services/userService.js";

class UserControllerClass {
  // reg controller
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { userName, email, password } = req.body;

      const invite = await UserService.createInvite({
        userName,
        email,
        password,
      });

      return res.json(invite);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Login controller
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const userData = await UserService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // auth controller
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
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async activate(req: any, res: Response) {
    try {
      const { token: activationToken } = req.query || req.params;

      if (!activationToken) throw createError(404, "Cannot get activate token");

      const userData = await UserService.activate(activationToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      // return res.redirect(process.env.CLIENT_URL || "");
      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async refresh(req: any, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await UserService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Need create
  async logout(req: any, res: Response) {
    try {
      const { refreshToken } = req.cookies;
      const id = req.user?.id;

      const user = await UserService.logout(id, refreshToken);

      res.clearCookie("refreshToken");

      return res.status(200).json({ message: `User ${user.email} was successfully logout` });
    } catch (error: any) {
      logger.error(error.message, error);
      res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async changeInfo(req: Request, res: Response) {
    try {
      // const {email, firstName, lastName} = req.body
      // const user = await User.findOne({where: {id: req.user.id}})
      // user.email = email
      // user.firstName = firstName
      // user.lastName = lastName
      // user.save()
      // return res.json(user)
    } catch (error: any) {
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const UserController = new UserControllerClass();
