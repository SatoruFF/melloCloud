import * as WebSocket from "ws";

declare module "ws" {
  interface WebSocket {
    userId?: number;
  }
}
