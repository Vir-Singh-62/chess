import WebSocket from "ws";
import { connectedIds, getNewId } from "..";
import { clients, ids } from "../../main";
import { handleRoomLeave } from "./room";

export function handleConnection(ws: WebSocket) {
  const id = getNewId();
  clients.set(id, ws);
  ids.set(ws, id);
}

export function handleDisconnect(ws: WebSocket) {
  handleRoomLeave(ws);
  const id = ids.get(ws);
  if (!id) return;
  clients.delete(id);
  ids.delete(ws);
  connectedIds.delete(id);
}
