import { useEffect, useState, useRef } from "react";
import type { Message } from "../../../entities/message";
import { socket } from "../lib/socket";
import { useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const currentUser = useAppSelector(getUserSelector);

  useEffect(() => {
    socketRef.current = socket();

    socketRef.current.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = (text: string) => {
    const currentUserId = currentUser?.id;
    if (!currentUserId) throw new Error("User id cannot be undefined");
    const newMessage: Message = {
      id: Date.now(),
      senderId: currentUserId,
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
