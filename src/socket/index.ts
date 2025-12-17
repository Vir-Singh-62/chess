import WebSocket from "ws";
import { ids, wss } from "../main";
import "./handlers";
import "./validator";

export function broadcast(event: string, payload: unknown) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: event, data: payload }));
    }
  });
}

export function send(
  socket: WebSocket | WebSocket[],
  event: string,
  payload: unknown
) {
  if (Array.isArray(socket)) {
    socket.forEach((s) =>
      s.send(JSON.stringify({ type: event, data: payload }))
    );
    return;
  }
  socket.send(JSON.stringify({ type: event, data: payload }));
}

export function getId(socket: WebSocket): number {
  return ids.get(socket) || -1;
}

export const connectedIds = new Set<number>();
export function getNewId(): number {
  for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
    if (!connectedIds.has(i)) {
      connectedIds.add(i);
      return i;
    }
  }
  return -1;
}

export const parse = <T = unknown>(raw: string): T => {
  const msg = JSON.parse(raw) as { type: string; data: T };
  return msg.data as T;
};
