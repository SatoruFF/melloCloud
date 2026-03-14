// base
import { imagekit, prisma } from '../configs/config.js';

import createError from 'http-errors';
import _ from 'lodash';
import { createReadStream } from 'streamifier';
// utils
import { v4 as uuidv4 } from 'uuid';

class AvatarClass {
  async uploadAvatar(fileBuffer: Buffer, userId: number): Promise<string | undefined> {
    const fileStream = createReadStream(fileBuffer);

    const avatarName = uuidv4() + '.png';

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw createError(404, 'User not found');
    }

    // in first, we must delete old avatar
    if (user.avatar) {
      const fileList = await imagekit.listFiles({});

      const file = _.isArray(fileList) && fileList.find(file => (file as any).url === user.avatar);

      if (file && typeof file === 'object') {
        await imagekit.deleteFile((file as any).fileId);
      }
    }

    const uploadedImage = await imagekit.upload({
      file: fileStream as any,
      fileName: avatarName,
      extensions: [
        {
          name: 'google-auto-tagging',
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });

    const newAvatar = (uploadedImage as any).url as string;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: newAvatar,
      },
    });

    return newAvatar;
  }

  async deleteAvatar(userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw createError(404, 'User not found');
    }

    if (!user.avatar) {
      throw createError(404, 'avatar not found');
    }

    const fileList = await imagekit.listFiles({});

    const file = _.isArray(fileList) && fileList.find(file => (file as any).url === user.avatar);

    if (file && typeof file === 'object') {
      await imagekit.deleteFile((file as any).fileId);
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: null,
      },
    });

    return {
      ...user,
      avatar: null,
      diskSpace: user.diskSpace.toString(),
      usedSpace: user.usedSpace.toString(),
    };
  }
}

export const Avatar = new AvatarClass();
