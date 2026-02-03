import * as Y from "yjs";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { Variables } from "../../consts/localVariables";

/**
 * Кастомный WebSocket провайдер для Yjs
 * Адаптирован под наш бэкенд с JWT аутентификацией
 */
export class YjsWebSocketProvider {
  private ws: WebSocket | null = null;
  private doc: Y.Doc;
  private noteId: string;
  private token: string;
  private connected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(doc: Y.Doc, noteId: string, token: string) {
    this.doc = doc;
    this.noteId = noteId;
    this.token = token;
    this.connect();
  }

  private connect() {
    try {
      const wsUrl = Variables.Socket_Yjs_Notes_URL || Variables.Socket_Notes_URL.replace("/ws/notes", "/ws/yjs-notes");
      this.ws = new WebSocket(wsUrl, this.token);

      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;

        // Отправить join_note сообщение
        this.ws?.send(
          JSON.stringify({
            action: "join_note",
            noteId: Number(this.noteId),
          })
        );
      };

      this.ws.onmessage = (event: MessageEvent) => {
        // Проверить, это JSON или бинарные данные
        if (typeof event.data === "string") {
          try {
            const data = JSON.parse(event.data);
            if (data.action === "joined") {
              // Успешно присоединились, начинаем синхронизацию
              this.sync();
            } else if (data.action === "error") {
              console.error("[YjsProvider] Server error:", data.message);
            }
          } catch (e) {
            // Не JSON, игнорируем
          }
        } else if (event.data instanceof ArrayBuffer) {
          // Бинарные данные от Yjs
          this.handleYjsMessage(new Uint8Array(event.data));
        }
      };

      this.ws.onerror = (error) => {
        console.error("[YjsProvider] WebSocket error:", error);
        this.connected = false;
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.reconnect();
      };

      // Обработка обновлений документа для отправки на сервер
      this.doc.on("update", (update: Uint8Array, origin: any) => {
        if (origin !== this && this.connected && this.ws?.readyState === WebSocket.OPEN) {
          this.sendYjsUpdate(update);
        }
      });
    } catch (error) {
      console.error("[YjsProvider] Connection error:", error);
      this.reconnect();
    }
  }

  private sync() {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    // Отправить запрос на синхронизацию (sync step 1)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0); // messageSync
    encoding.writeVarUint(encoder, 0); // sync step 1
    const message = encoding.toUint8Array(encoder);
    this.ws.send(message);
  }

  private handleYjsMessage(message: Uint8Array) {
    try {
      const decoder = decoding.createDecoder(message);
      const messageType = decoding.readVarUint(decoder);

      if (messageType === 0) {
        // Sync message
        const syncType = decoding.readVarUint(decoder);
        if (syncType === 1) {
          // Sync step 2 - получить состояние
          const state = decoding.readVarUint8Array(decoder);
          Y.applyUpdate(this.doc, state);
        } else if (syncType === 2) {
          // Update - применить обновление
          const update = decoding.readVarUint8Array(decoder);
          Y.applyUpdate(this.doc, update, this);
        }
      } else if (messageType === 1) {
        // Awareness message - обрабатываем курсоры и выделения
        // Упрощенная обработка awareness (можно расширить позже)
      }
    } catch (error) {
      console.error("[YjsProvider] Error handling Yjs message:", error);
    }
  }

  private sendYjsUpdate(update: Uint8Array) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Отправить update сообщение
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 0); // messageSync
      encoding.writeVarUint(encoder, 2); // update
      encoding.writeVarUint8Array(encoder, update);
      const message = encoding.toUint8Array(encoder);
      this.ws.send(message);
    } catch (error) {
      console.error("[YjsProvider] Error sending update:", error);
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[YjsProvider] Max reconnect attempts reached");
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimeout = setTimeout(() => {
      console.log(`[YjsProvider] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
  }

  public get isConnected(): boolean {
    return this.connected;
  }
}
