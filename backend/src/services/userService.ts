import { prisma } from '../configs/config.js';
import { UserDto } from '../helpers/dtos/user-dto.js';
// @ts-nocheck
// FIXME: remove this in future
// base
import { FileService } from './fileService.js';
import { MailService } from './mailService.js';

import bcrypt from 'bcrypt';
// utils
import _ from 'lodash';
import 'dotenv/config.js';
import createError from 'http-errors';
// import { v4 as uuidv4 } from "uuid";
import { generateJwt } from '../utils/generateJwt.js';
import { validateAccessToken, validateRefreshToken } from '../utils/validateJwt.js';

interface IUserData {
  email: string;
  password: string;
  userName?: string | null;
}

const invitePrivateProps = ['activationToken', 'password'];

class UserServiceClass {
  async createInvite({ userName, email, password }: IUserData): Promise<any> {
    return prisma.$transaction(async trx => {
      // Validate user data, cause user already may be exist
      const candidate = await trx.user.findUnique({
        where: {
          email,
        },
      });

      if (candidate) {
        throw createError(400, `User with email: ${email} already exists`);
      }

      let { accessToken: activationToken } = generateJwt(email);

      const hashPassword = await bcrypt.hash(password, 5);

      const invite = await trx.invite.create({
        data: {
          userName,
          email,
          password: hashPassword,
          activationToken,
        },
      });

      activationToken = `${process.env.CLIENT_URL}/activate?token=${activationToken}`;

      await MailService.sendActivationMail(email, {
        ...invite,
        activationToken,
      });

      return _.omit(invite, invitePrivateProps);
    });
  }

  async registration(userData: IUserData) {
    return prisma.$transaction(async trx => {
      // Validate user data

      const { email, password, userName } = userData;

      const candidate = await trx.user.findUnique({
        where: {
          email,
        },
      });

      if (candidate) {
        throw createError(400, `User with email: ${userData.email} already exists`);
      }

      // create user in dataBase
      // const hashPassword = await bcrypt.hash(userData.password, 5);

      if (!password) {
        throw createError(400, `Cannot get user password from invite`);
      }

      // let activationToken: string = uuidv4();

      const user = await trx.user.create({
        data: {
          userName,
          email,
          password,
          // activationLink,
        },
      });

      // activationToken = `${process.env.API_URL}/api/user/activate/${activationToken}`;

      // await MailService.sendActivationMail(userData.email, {
      //   ...user,
      //   activationToken,
      // });

      const { accessToken, refreshToken } = generateJwt(user.id);

      await trx.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // to-do: add internationalization and select to language option
      await trx.userConfig.create({
        data: {
          userId: user.id,
        },
      });

      const baseDir = { userId: user.id, path: '', type: 'dir', name: '' };

      // create new base dir for user
      await FileService.createDir(baseDir);

      const diskSpace = user.diskSpace.toString();
      const usedSpace = user.usedSpace.toString();

      const userDto = new UserDto({
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          diskSpace,
          usedSpace,
          avatar: user.avatar,
          isActivated: user.isActivated,
          role: user.role,
        },
      });

      return userDto;
    });
  }

  async login(email: string, password: string) {
    return prisma.$transaction(async trx => {
      const user: any = await trx.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw createError(400, `User with email: ${email} not found`);
      }

      const isPassValid = bcrypt.compareSync(password, user.password);

      if (!isPassValid) {
        throw createError(400, `Uncorrect login or email`);
      }

      const { accessToken, refreshToken } = generateJwt(user.id);

      await trx.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      const diskSpace = user.diskSpace.toString();
      const usedSpace = user.usedSpace.toString();

      const userDto = new UserDto({
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          diskSpace,
          usedSpace,
          avatar: user.avatar,
          role: user.role,
        },
      });

      return userDto;
    });
  }

  async auth(id: number | undefined) {
    const user: any = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    const { accessToken, refreshToken } = generateJwt(user.id);

    const diskSpace = user.diskSpace.toString();
    const usedSpace = user.usedSpace.toString();

    return new UserDto({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        diskSpace,
        usedSpace,
        avatar: user.avatar,
        role: user.role,
      },
    });
  }

  async activate(activationToken: string) {
    return prisma.$transaction(async trx => {
      const { payload: emailFromInvite } = validateAccessToken(activationToken) || {};

      if (!emailFromInvite) {
        throw createError('401', 'Auth error, may be token is expired');
      }

      const invite = await trx.invite.findFirst({
        where: {
          email: emailFromInvite,
        },
      });

      if (!invite) {
        throw createError(404, 'Invite not found for email address: ' + emailFromInvite);
      }

      const { email, password, userName } = invite;

      const userData = await this.registration({
        email,
        password,
        userName,
      });

      const userId = userData.user.id;

      userId &&
        (await trx.user.update({
          where: { id: userId },
          data: { isActivated: true },
        }));

      return userData;
    });
  }

  async refresh(refreshToken) {
    return prisma.$transaction(async trx => {
      if (!refreshToken) {
        throw createError(404, 'Not found token');
      }

      const userId = validateRefreshToken(refreshToken);

      const foundedUser = await trx.user.findFirst({
        where: { refreshToken },
      });

      if (!foundedUser || !userId) {
        throw createError(404, 'User not found');
      }

      const { accessToken, refreshToken: newToken } = generateJwt(foundedUser.id);

      const user = await trx.user.update({
        where: {
          id: foundedUser.id,
        },
        data: { refreshToken: newToken },
      });

      return new UserDto({
        user,
        token: accessToken,
      });
    });
  }

  async logout(refreshToken: string) {
    return prisma.$transaction(async trx => {
      const user = await trx.user.update({
        where: {
          refreshToken,
        },
        data: { refreshToken: null },
      });

      return user;
    });
  }
}

export const UserService = new UserServiceClass();
