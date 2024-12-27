// @ts-nocheck
// FIXME: remove this in future
// base
import { prisma, imagekit } from "../configs/config.js";

// utils
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import createError from "http-errors";
import { createReadStream } from "streamifier";

class AvatarClass {
  async uploadAvatar(fileBuffer, userId) {
    const fileStream = createReadStream(fileBuffer);

    const avatarName = uuidv4() + ".png";

    const user: any = await prisma.user.findFirst({
      where: { id: userId },
    });

    // in first, we must delete old avatar
    if (user.avatar) {
      const fileList = await imagekit.listFiles();

      const file =
        _.isArray(fileList) &&
        fileList.find((file) => file.url === user.avatar);

      const fileId = file ? file.fileId : null;

      await imagekit.deleteFile(fileId);
    }

    const uploadedImage = await imagekit.upload({
      file: fileStream,
      fileName: avatarName,
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });

    user.avatar = uploadedImage.url;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: user.avatar,
      },
    });

    return user.avatar;
  }

  async deleteAvatar(userId) {
    const user: any = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user.avatar) {
      throw createError(404, "avatar not found");
    }

    const fileList: any = await imagekit.listFiles();

    const file =
      _.isArray(fileList) && fileList.find((file) => file.url === user.avatar);

    const fileId = file ? file.fileId : null;

    await imagekit.deleteFile(fileId);

    user.avatar = null;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: user.avatar,
      },
    });

    user.diskSpace = user.diskSpace.toString();
    user.usedSpace = user.usedSpace.toString();

    return user;
  }
}

export const Avatar = new AvatarClass();
