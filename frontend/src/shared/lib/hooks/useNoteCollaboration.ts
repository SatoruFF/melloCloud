// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";
import { Variables } from "../../consts/localVariables";

export interface Collaborator {
  userId: number;
  userName: string;
  avatar?: string;
  color: string;
  cursorPosition?: { line: number; column: number };
  selection?: { from: unknown; to: unknown };
}

export interface UseNoteCollaborationOptions {
  noteId: string;
  onContentUpdate?: (data: {
    userId: number;
    operation: string;
    data: unknown;
    version: number;
    timestamp?: string;
  }) => void;
  onConflict?: (serverVersion: number) => void;
}

export function useNoteCollaboration({
  noteId,
  onContentUpdate,
  onConflict,
}: UseNoteCollaborationOptions) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onContentUpdateRef = useRef(onContentUpdate);
  const onConflictRef = useRef(onConflict);
  onContentUpdateRef.current = onContentUpdate;
  onConflictRef.current = onConflict;

  const send = useCallback((payload: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const sendCursorUpdate = useCallback(
    (line: number, column: number) => {
      send({
        action: "cursor_update",
        noteId: Number(noteId),
        payload: { line, column },
      });
    },
    [noteId, send],
  );

  const sendSelectionUpdate = useCallback(
    (from: unknown, to: unknown) => {
      send({
        action: "selection_update",
        noteId: Number(noteId),
        payload: { from, to },
      });
    },
    [noteId, send],
  );

  const sendContentChange = useCallback(
    (operation: string, data: unknown, version?: number) => {
      send({
        action: "content_change",
        noteId: Number(noteId),
        payload: { operation, data, version },
      });
    },
    [noteId, send],
  );

  const sendHeartbeat = useCallback(() => {
    send({ action: "heartbeat", noteId: Number(noteId) });
  }, [noteId, send]);

  useEffect(() => {
    if (!noteId || noteId === "new") return;

    const token = localStorage.getItem("token") || "";
    const socket = new WebSocket(Variables.Socket_Notes_URL, token);
    socketRef.current = socket;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as {
          action: string;
          collaborators?: Collaborator[];
          version?: number;
          user?: Collaborator;
          userId?: number;
          position?: { line: number; column: number };
          selection?: { from: unknown; to: unknown };
          userId?: number;
          operation?: string;
          data?: unknown;
          version?: number;
          serverVersion?: number;
        };

        switch (data.action) {
          case "joined":
            setIsConnected(true);
            setCollaborators(data.collaborators ?? []);
            setCurrentVersion(data.version ?? 1);
            if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = setInterval(sendHeartbeat, 30000);
            break;

          case "user_joined":
            setCollaborators((prev) => {
              const user = data.user;
              if (!user || prev.some((c) => c.userId === user.userId)) return prev;
              return [...prev, user];
            });
            break;

          case "user_left":
            setCollaborators((prev) => prev.filter((c) => c.userId !== data.userId));
            break;

          case "cursor_moved":
            setCollaborators((prev) =>
              prev.map((c) =>
                c.userId === data.userId ? { ...c, cursorPosition: data.position } : c,
              ),
            );
            break;

          case "selection_changed":
            setCollaborators((prev) =>
              prev.map((c) =>
                c.userId === data.userId ? { ...c, selection: data.selection } : c,
              ),
            );
            break;

          case "content_updated":
            setCurrentVersion(data.version ?? 1);
            onContentUpdateRef.current?.({
              userId: data.userId ?? 0,
              operation: data.operation ?? "REPLACE",
              data: data.data,
              version: data.version ?? 1,
              timestamp: data.timestamp as string | undefined,
            });
            break;

          case "conflict":
            onConflictRef.current?.(data.serverVersion ?? 1);
            break;

          case "error":
            console.error("[NoteCollab]", data);
            break;

          default:
            break;
        }
      } catch (e) {
        console.error("[NoteCollab] Parse error:", e);
      }
    };

    socket.onopen = () => {
      send({
        action: "join_note",
        noteId: Number(noteId),
      });
    };

    socket.onmessage = (event) => handleMessage(event);
    socket.onerror = (err) => console.error("[NoteCollab] WebSocket error:", err);
    socket.onclose = () => {
      setIsConnected(false);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "leave_note", noteId: Number(noteId) }));
      }
      socket.close();
      socketRef.current = null;
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };
  }, [noteId, sendHeartbeat]);

  return {
    collaborators,
    isConnected,
    currentVersion,
    sendCursorUpdate,
    sendSelectionUpdate,
    sendContentChange,
  };
}
