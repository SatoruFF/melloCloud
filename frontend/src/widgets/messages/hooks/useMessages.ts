import { useEffect, useState, useRef } from "react";
import type { Message } from "../../../entities/message";
import { getSocket } from "../lib/socket";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const currentUser = useAppSelector(getUserSelector);
  const currentChat = useAppSelector(getCurrentChat);

  // Установка сокета и обработка сообщений
  useEffect(() => {
    socketRef.current = getSocket();

    socketRef.current.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);

      // Проверяем, что сообщение относится к текущему чату по receiver.id
      // if (newMessage.senderId === currentChat?.receiver?.id || newMessage.receiverId === currentChat?.receiver?.id) {
      setMessages((prev) => [...prev, newMessage]);
      // }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [currentChat?.receiver?.id]);

  // Сброс сообщений при смене чата
  useEffect(() => {
    setMessages([]);
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
    console.log("⚠ :: sendMessage :: newMessage:", newMessage);
    socketRef.current?.send(JSON.stringify(newMessage));
  };

  return { messages, sendMessage };
};
