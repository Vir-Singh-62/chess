import WebSocket from "ws";
import { parse, send } from "..";
import { sendBoard, initializeGame, gameInfos } from "./gamePlay";

export const rooms = new Map<
  number,
  { white: WebSocket | null; black: WebSocket | null }
>();
const whites = new Map<WebSocket, number>();
const blacks = new Map<WebSocket, number>();

export function handleRoomCreation(ws: WebSocket, raw: string) {
  const roomId = getNewRoomId();
  const data = parse<{ color?: "white" | "black" }>(raw);

  if (!data.color) {
    data.color = "white";
  }
  initializeGame(roomId);
  const board = gameInfos.get(roomId)?.board;

  if (data.color === "white") {
    whites.set(ws, roomId);
    rooms.set(roomId, { white: ws, black: null });
    send(ws, "room_create", { roomId: roomId, color: "white", board });
  } else {
    blacks.set(ws, roomId);
    rooms.set(roomId, { white: null, black: ws });
    send(ws, "room_create", { roomId: roomId, color: "black", board });
  }

  sendBoard(roomId);
}

export function handleRoomJoin(ws: WebSocket, raw: string) {
  const data = parse<{ roomId: number }>(raw);
  const room = rooms.get(data.roomId);

  if (!room) {
    send(ws, "joinRoom", { message: "Room not found" });
  }

  if (room?.white && room?.black) {
    send(ws, "joinRoom", { message: "Room is full" });
    return;
  }

  if (!room?.white) {
    whites.set(ws, data.roomId);
    rooms.set(data.roomId, { white: ws, black: room?.black! });
    send([ws, room?.black!], "joinRoom", {
      message: "Joined Room Successfully",
    });
  } else if (!room?.black) {
    blacks.set(ws, data.roomId);
    rooms.set(data.roomId, { white: room?.white!, black: ws });
    send([ws, room?.white!], "joinRoom", {
      message: "Joined Room Successfully",
    });
  }

  sendBoard(data.roomId);
}

export function handleRoomLeave(ws: WebSocket) {
  const roomId = getRoomId(ws);
  let room = rooms.get(roomId);

  send(ws, "leaveRoom", { message: "Left Room Successfully" });

  if (whites.has(ws)) {
    whites.delete(ws);
    room = { white: null, black: room?.black! };
    if (room?.black) {
      send(room?.black, "leaveRoom", { color: "white" });
      return;
    }
  }

  if (blacks.has(ws)) {
    blacks.delete(ws);
    room = { white: room?.white!, black: null };
    if (room?.white) {
      send(room?.white, "leaveRoom", { color: "black" });
      return;
    }
  }

  rooms.delete(roomId);
}

const roomId = new Set<number>();
function getNewRoomId(): number {
  for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
    if (!roomId.has(i)) {
      roomId.add(i);
      return i;
    }
  }
  return -1;
}

export function getRoomId(ws: WebSocket): number {
  if (whites.has(ws)) {
    return whites.get(ws)!;
  } else if (blacks.has(ws)) {
    return blacks.get(ws)!;
  }
  return -1;
}
