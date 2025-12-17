import { prisma } from "../configs/config.js";
import { UserDto } from "../dtos/user-dto.js";
// utils
import _ from "lodash";
import "dotenv/config.js";
import { deserializeMessage, serializeMessage } from "../helpers/messageSerializer.js";

class ChatServiceClass {
  async getUserChats(context, userId: number) {
    const chats = await context.prisma.chat.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // только последнее сообщение, для тайтла
        },
      },
    });

    if (!chats || chats.length === 0) {
      return [];
    }

    if (!chats || chats.length === 0) {
      //   throw createError(404, "Chats not found");
      return [];
    }

    // TODO: need DTO & optimize wuth sel chat
    return Promise.all(
      chats.map(async (chat) => {
        const lastMessage = chat.messages[0];
        const isGroup = chat.isGroup;
        // FIXME: any
        const uniqueUsers = _.uniqBy(chat.users, "userId") as any[];
        const isSelfChat = uniqueUsers.length === 1 && (uniqueUsers[0] as any)?.userId == userId;

        let receiver = null;
        if (isGroup) {
          receiver = null;
        } else if (isSelfChat) {
          receiver = chat.users[0]?.user;
        } else {
          receiver = chat.users.find((u) => u.userId !== userId)?.user;
        }

        const { text: deserializedTitle } =
          (await deserializeMessage<{
            text?: string;
          }>(lastMessage?.text || chat.title || null)) || {};

        return {
          id: chat.id,
          title: deserializedTitle,
          isGroup,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          isSelfChat,
          receiver: receiver
            ? {
                id: receiver.id,
                userName: receiver.userName,
                avatar: receiver.avatar,
              }
            : null,
        };
      })
    );
  }

  async findPrivateChat(prisma, userA: number, userB: number) {
    const chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          some: { userId: userA },
        },
        AND: [
          {
            users: {
              some: { userId: userB },
            },
          },
        ],
      },
      include: {
        users: true,
      },
    });

    if (
      chat &&
      chat.users.length === 2 &&
      chat.users.some((u) => u.userId === userA) &&
      chat.users.some((u) => u.userId === userB)
    ) {
      return chat;
    }

    return null;
  }

  async getOrCreatePrivateChat(prisma, { senderId, receiverId, text }) {
    const existingChat = await this.findPrivateChat(prisma, senderId, receiverId);

    if (existingChat) {
      return existingChat.id;
    }

    const encryptedTitle = await serializeMessage(text || "");

    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        title: text ? encryptedTitle : "",
        users: {
          create: [{ user: { connect: { id: senderId } } }, { user: { connect: { id: receiverId } } }],
        },
      },
    });

    return newChat.id;
  }
}

export const ChatService = new ChatServiceClass();
