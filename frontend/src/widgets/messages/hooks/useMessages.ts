import { useEffect, useState, useRef } from "react";
import type { Message } from "../../../entities/message";
import { getSocket } from "../lib/socket";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import _ from "lodash-es";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const currentUser = useAppSelector(getUserSelector);
  const currentChat = useAppSelector(getCurrentChat);
  const currentChatIdRef = useRef<number | null>(null);

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
      // НЕ закрываем сокет при смене чата
      // socketRef.current?.close();
    };
  }, [currentChat?.receiver?.id]);

  // При смене чата обновляем список сообщений и реф
  useEffect(() => {
    setMessages([]);
    currentChatIdRef.current = currentChat?.receiver?.id || null;
  }, [currentChat?.receiver?.id]);

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

    setMessages((prev) => [...prev, newMessage]);
    socketRef.current?.send(JSON.stringify(newMessage));
  };

  return { messages, sendMessage };
};
