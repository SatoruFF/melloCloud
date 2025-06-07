import _ from "lodash-es";
import { useEffect, useState, useRef } from "react";
import { message as antdMessage } from "antd";
import type { Message } from "../../../entities/message";
import { getSocket } from "../lib/socket";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import { useLazyGetMessagesQuery } from "../../../entities/message/model/api/messagesApi";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const currentUser = useAppSelector(getUserSelector);
  const currentChat = useAppSelector(getCurrentChat);
  const currentChatIdRef = useRef<number | null>(null);

  const [fetchMessagesQuery] = useLazyGetMessagesQuery();

  // Один раз инициализируем сокет
  useEffect(() => {
    socketRef.current = getSocket();

    socketRef.current.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);

      // Фильтруем только сообщения текущего чата
      if (newMessage.senderId === currentChatIdRef.current || newMessage.receiverId === currentChatIdRef.current) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socketRef.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => {
      // socketRef.current?.close();
    };
  }, []);

  const fetchMessages = async (chatId: string | number, limit = 50, offset = 0) => {
    try {
      const result = await fetchMessagesQuery(String(chatId)).unwrap();
      if (result) {
        setMessages(result); // Тут можно сделать .reverse() если надо последние внизу
      }
    } catch (error) {
      // TODO: не работает сейчас почему то
      antdMessage.error("Failed to fetch messages");
      console.error("Failed to fetch messages", error);
    }
  };

  // При смене чата обновляем список сообщений и currentChatIdRef
  useEffect(() => {
    const chatId = currentChat?.id;
    if (chatId) {
      fetchMessages(chatId).then(() => {
        currentChatIdRef.current = Number(chatId);
      });
    }
  }, [currentChat?.id]);

  const sendMessage = (text: string) => {
    const currentUserId = currentUser?.id;
    const receiverId = currentChat?.receiver?.id;
    if (!currentUserId || !receiverId) return;

    const newMessage: Message = {
      senderId: currentUserId,
      receiverId,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      self: true,
    };

    socketRef.current?.send(JSON.stringify(newMessage));
  };

  return { messages, sendMessage, fetchMessages };
};
