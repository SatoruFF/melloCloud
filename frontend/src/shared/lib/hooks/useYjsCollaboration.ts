import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { YjsWebSocketProvider } from "../yjs/YjsWebSocketProvider";
import { Variables } from "../../consts/localVariables";

export interface UseYjsCollaborationOptions {
  noteId: string;
  initialContent?: any;
  onContentUpdate?: (content: any) => void;
}

export function useYjsCollaboration({ noteId, initialContent, onContentUpdate }: UseYjsCollaborationOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<YjsWebSocketProvider | null>(null);
  const yArrayRef = useRef<Y.Array<any> | null>(null);

  useEffect(() => {
    if (!noteId || noteId === "new") return;

    const token = localStorage.getItem("token") || "";
    if (!token) return;

    // Создать Y.Doc
    const doc = new Y.Doc();
    docRef.current = doc;

    // Создать Y.Array для хранения блоков BlockNote
    const yArray = doc.getArray("blocks");
    yArrayRef.current = yArray;

    // Инициализировать с существующим контентом
    if (initialContent && Array.isArray(initialContent)) {
      yArray.insert(0, initialContent);
    }

    // Создать провайдер
    const provider = new YjsWebSocketProvider(doc, noteId, token);
    providerRef.current = provider;

    // Обработка изменений Yjs -> обновление BlockNote
    yArray.observe((event) => {
      const content = yArray.toArray();
      onContentUpdate?.(content);
    });

    // Обработка подключения
    const checkConnection = setInterval(() => {
      if (provider.isConnected) {
        setIsConnected(true);
        clearInterval(checkConnection);
      }
    }, 100);

    return () => {
      clearInterval(checkConnection);
      provider.disconnect();
      doc.destroy();
      docRef.current = null;
      providerRef.current = null;
      yArrayRef.current = null;
    };
  }, [noteId, initialContent, onContentUpdate]);

  // Функция для обновления контента из BlockNote -> Yjs
  const updateContent = (content: any[]) => {
    if (!yArrayRef.current) return;

    const currentContent = yArrayRef.current.toArray();
    const contentStr = JSON.stringify(content);
    const currentStr = JSON.stringify(currentContent);

    if (contentStr !== currentStr) {
      // Обновить Y.Array
      yArrayRef.current.delete(0, yArrayRef.current.length);
      yArrayRef.current.insert(0, content);
    }
  };

  return {
    isConnected,
    collaborators,
    updateContent,
    doc: docRef.current,
  };
}
