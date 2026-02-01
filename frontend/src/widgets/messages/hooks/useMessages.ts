import _ from "lodash-es";
import { useEffect, useState, useRef } from "react";
import type { Message } from "../../../entities/message";
import { getSocket } from "../lib/socket";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import { useLazyGetMessagesQuery } from "../../../entities/message/model/api/messagesApi";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      if (newMessage.chatId === currentChatIdRef.current) {
        // FIXME: походу сокет отправляет сообщения дважды
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) => msg.id === newMessage.id);
          return alreadyExists ? prev : [...prev, newMessage];
        });
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
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchMessagesQuery(String(chatId)).unwrap();
      if (result) {
        setMessages([...result].reverse());
      }
    } catch (error) {
      const errorMessage = "Failed to fetch messages";
      setError(errorMessage);
      console.error(errorMessage, error);
    } finally {
      setIsLoading(false);
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
    if (!currentUserId) return;

    const isGroup = Boolean(currentChat?.isGroup);
    if (isGroup) {
      if (!currentChat?.id) return;
      socketRef.current?.send(JSON.stringify({ chatId: currentChat.id, senderId: currentUserId, text }));
    } else {
      const receiverId = currentChat?.receiver?.id;
      if (!receiverId) return;
      socketRef.current?.send(JSON.stringify({ receiverId, senderId: currentUserId, text }));
    }
  };

  return { messages, sendMessage, fetchMessages, error, isLoading };
};
