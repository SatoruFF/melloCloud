import { v4 as uuidv4 } from "uuid";
import { prisma } from "../configs/config.js";
import { UserDto } from "../dtos/user-dto.js";
import { FileService } from "./fileService.js";
import { MailService } from "./mailService.js";
import { SessionService } from "./sessionService.js";
import bcrypt from "bcryptjs";
import _ from "lodash";
import "dotenv/config.js";
import createError from "http-errors";
import { generateJwt } from "../utils/generateJwt.js";
import { validateAccessToken, validateRefreshToken } from "../utils/validateJwt.js";

interface IUserData {
  email: string;
  password: string;
  userName?: string | null;
}

interface ILoginMetadata {
  userAgent?: string;
  ip?: string;
}

const invitePrivateProps = ["activationToken", "password"];

class UserServiceClass {
  async createInvite({ userName, email, password }: IUserData): Promise<any> {
    return prisma.$transaction(async (trx) => {
      const candidate = await trx.user.findUnique({ where: { email } });
      if (candidate) {
        throw createError(400, `User with email: ${email} already exists`);
      }

      const existingUserName = await trx.user.findFirst({ where: { userName } });
      if (existingUserName) {
        throw createError(400, `User with username: ${userName} already exists`);
      }

      let { accessToken: activationToken } = generateJwt(email);
      const hashPassword = await bcrypt.hash(password, 5);

      const invite = await trx.invite.create({
        data: { userName, email, password: hashPassword, activationToken },
      });

      activationToken = `${process.env.CLIENT_URL}/activate?token=${activationToken}`;
      await MailService.sendActivationMail(email, { ...invite, activationToken });

      return _.omit(invite, invitePrivateProps);
    });
  }

  async registration(userData: IUserData) {
    return prisma.$transaction(async (trx) => {
      const { email, password, userName } = userData;

      const candidate = await trx.user.findUnique({ where: { email } });
      if (candidate) {
        throw createError(400, `User with email: ${userData.email} already exists`);
      }

      if (!password) {
        throw createError(400, `Cannot get user password from invite`);
      }

      const storageGuid = uuidv4();

      const user = await trx.user.create({
        data: { userName, email, password, storageGuid },
      });

      const { accessToken, refreshToken } = generateJwt(user.id);

      console.log(2222, refreshToken)

      await trx.userConfig.create({ data: { userId: user.id } });

      const baseDir = {
        userId: user.id,
        path: "",
        type: "dir",
        name: "",
        storageGuid,
      };

      await FileService.createDir(baseDir);

      const diskSpace = user.diskSpace.toString();
      const usedSpace = user.usedSpace.toString();

      const userDto = new UserDto({
        id: user.id,
        userName: user.userName,
        email: user.email,
        storageGuid: user.storageGuid,
        diskSpace,
        usedSpace,
        avatar: user.avatar,
        isActivated: user.isActivated,
        role: user.role,
        token: accessToken,
        refreshToken,
      });

      return userDto;
    });
  }

  async login(email: string, password: string, metadata?: ILoginMetadata) {
    return prisma.$transaction(async (trx) => {
      const user: any = await trx.user.findUnique({ where: { email } });

      if (!user) {
        throw createError(400, `User with email: ${email} not found`);
      }

      // Проверяем, что у пользователя есть пароль (не OAuth)
      if (!user.password) {
        throw createError(400, `This account uses OAuth. Please login with ${user.oauthProvider}`);
      }

      const isPassValid = bcrypt.compareSync(password, user.password);
      if (!isPassValid) {
        throw createError(400, `Incorrect login or password`);
      }

      const { accessToken, refreshToken } = generateJwt(user.id);

      // Создаем новую сессию
      const session = await trx.session.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: metadata?.userAgent || "Unknown",
          ip: metadata?.ip || "Unknown",
        },
      });

      // Проверяем количество активных сессий
      const sessionsCount = await trx.session.count({
        where: { userId: user.id },
      });

      // Если больше 5 сессий, удаляем самую старую
      // TODO: Вынести в конфиг
      if (sessionsCount > 5) {
        const oldestSession = await trx.session.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
        });

        if (oldestSession) {
          await trx.session.delete({ where: { id: oldestSession.id } });
        }
      }

      const diskSpace = user.diskSpace.toString();
      const usedSpace = user.usedSpace.toString();

      const userDto = new UserDto({
        id: user.id,
        userName: user.userName,
        email: user.email,
        storageGuid: user.storageGuid,
        diskSpace,
        usedSpace,
        avatar: user.avatar,
        role: user.role,
        token: accessToken,
        refreshToken,
      });

      return userDto;
    });
  }

  async auth(id: number | undefined) {
    const user: any = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw createError(404, "User not found");
    }

    const { accessToken, refreshToken } = generateJwt(user.id);
    const diskSpace = user.diskSpace.toString();
    const usedSpace = user.usedSpace.toString();

    return new UserDto({
      id: user.id,
      userName: user.userName,
      email: user.email,
      storageGuid: user.storageGuid,
      diskSpace,
      usedSpace,
      avatar: user.avatar,
      role: user.role,
      token: accessToken,
      refreshToken,
    });
  }

  async activate(activationToken: string, metadata?: ILoginMetadata) {
    return prisma.$transaction(async (trx) => {
      const { payload: emailFromInvite } = (validateAccessToken(activationToken) as any) || {};

      if (!emailFromInvite) {
        throw createError(401, "Auth error, may be token is expired");
      }

      const invite = await trx.invite.findFirst({ where: { email: emailFromInvite } });
      if (!invite) {
        throw createError(404, "Invite not found for email address: " + emailFromInvite);
      }

      const { email, password, userName } = invite;

      const userData = await this.registration({ email, password, userName });
      const userId = userData.user.id;

      if (userId) {
        await trx.user.update({
          where: { id: userId },
          data: { isActivated: true },
        });

        // Создаем сессию при активации
        await trx.session.create({
          data: {
            userId,
            refreshToken: userData.refreshToken,
            userAgent: metadata?.userAgent || "Unknown",
            ip: metadata?.ip || "Unknown",
          },
        });

        // Помечаем инвайт как использованный
        await trx.invite.delete({
          where: { id: invite.id },
          // data: { isUsed: true, userId },
        });
      }

      return userData;
    });
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw createError(404, "Not found token");
    }

    return prisma.$transaction(async (trx) => {
      // Проверяем валидность токена
      const decoded: any = validateRefreshToken(refreshToken);
      const userId = decoded?.payload;

      if (!userId) {
        throw createError(401, "Invalid token");
      }

      // Ищем сессию по refreshToken
      const session = await trx.session.findFirst({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session) {
        throw createError(404, "Session not found");
      }

      // Генерируем новые токены
      const { accessToken, refreshToken: newToken } = generateJwt(session.userId);

      // Обновляем сессию
      await trx.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newToken,
          lastActivity: new Date(),
        },
      });

      const user = session.user;

      return new UserDto({
        id: user.id,
        userName: user.userName,
        email: user.email,
        storageGuid: user.storageGuid,
        diskSpace: user.diskSpace.toString(),
        usedSpace: user.usedSpace.toString(),
        avatar: user.avatar,
        role: user.role,
        token: accessToken,
        refreshToken: newToken,
      });
    });
  }

  async logout(id: number, refreshToken: string) {
    return prisma.$transaction(async (trx) => {
      const session = await trx.session.findFirst({
        where: { refreshToken, userId: id },
      });

      if (session) {
        await trx.session.delete({ where: { id: session.id } });
      }

      return await trx.user.findUnique({ where: { id } });
    });
  }

  async logoutAll(id: number) {
    return prisma.$transaction(async (trx) => {
      await trx.session.deleteMany({ where: { userId: id } });
      return await trx.user.findUnique({ where: { id } });
    });
  }

  async getSessions(id: number) {
    return await prisma.session.findMany({
      where: { userId: id },
      orderBy: { lastActivity: "desc" },
      select: {
        id: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        lastActivity: true,
      },
    });
  }

  async deleteSession(userId: number, sessionId: string) {
    return prisma.$transaction(async (trx) => {
      const session = await trx.session.findFirst({
        where: { id: sessionId, userId },
      });

      if (!session) {
        throw createError(404, "Session not found");
      }

      await trx.session.delete({ where: { id: sessionId } });
      return session;
    });
  }

  async search(context: any, query: string) {
    return await context.prisma.user.findMany({
      where: {
        userName: { contains: query, mode: "insensitive" },
      },
      select: { id: true, userName: true },
    });
  }

  async getById(context: any, id: number) {
    return await context.prisma.user.findFirst({
      where: { id: { equals: id } },
      select: { id: true, userName: true },
    });
  }
}

export const UserService = new UserServiceClass();
