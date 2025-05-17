import { Variables } from "../../../shared/consts/localVariables";

export const socket = () => {
  return new WebSocket(Variables.Socket_URL);
};
