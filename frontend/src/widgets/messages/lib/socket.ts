import { Variables } from "../../../shared/consts/localVariables";

// singleton in HMR mode
let socketInstance: WebSocket | null = null;

export const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem("token") || "";
    socketInstance = new WebSocket(Variables.Socket_URL, token);
  }
  return socketInstance;
};
