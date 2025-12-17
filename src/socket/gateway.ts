import WebSocket from "ws";
import { handleConnection, handleDisconnect } from "./handlers/connection";
import { wss } from "../main";
import {
  handleRoomCreation,
  handleRoomJoin,
  handleRoomLeave,
} from "./handlers/room";
import { handleMove } from "./handlers/gamePlay";

wss.on("connection", (ws: WebSocket) => {
  handleConnection(ws);

  ws.on("ping", () => {
    ws.pong();
  });

  // Rooms
  {
    ws.on("createRoom", (raw: string) => {
      handleRoomCreation(ws, raw);
    });

    ws.on("joinRoom", (raw: string) => {
      handleRoomJoin(ws, raw);
    });

    ws.on("leaveRoom", () => {
      handleRoomLeave(ws);
    });
  }

  //Gameplay
  {
    ws.on("move", (raw: string) => {
      handleMove(ws, raw);
    });
  }

  ws.on("close", () => {
    handleDisconnect(ws);
  });
});
