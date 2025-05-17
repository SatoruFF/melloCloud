import { useEffect, useState, useRef } from "react";
import type { Message } from "../../../entities/message";
import { socket } from "../lib/socket";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

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
    const newMessage: Message = {
      id: Date.now(),
      sender: "Me",
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
