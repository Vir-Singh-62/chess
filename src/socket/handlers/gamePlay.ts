import WebSocket from "ws";
import { parse, send } from "..";
import { getRoomId, rooms } from "./room";
import { validateMove } from "../validator/input";
import { isLegalMove, movePiece } from "../../engine";

export type Piece =
  | "bn"
  | "bq"
  | "br"
  | "bb"
  | "bk"
  | "bp"
  | null
  | "wn"
  | "wq"
  | "wr"
  | "wb"
  | "wk"
  | "wp";

export type ChessBoard = Piece[][];

export const chessBoards = new Map<number, ChessBoard>();
export const colorToMove = new Map<number, "white" | "black">();

export function handleMove(ws: WebSocket, raw: string) {
  const data = parse<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    promoteTo?: Piece;
  }>(raw);
  const roomId = getRoomId(ws);
  const room = rooms.get(roomId);
  const board = chessBoards.get(roomId);

  if (ws !== room?.white || ws !== room?.black || !board) return;

  if (ws === room?.white && data.promoteTo?.startsWith("b"))
    data.promoteTo = undefined;
  if (ws === room?.black && data.promoteTo?.startsWith("w"))
    data.promoteTo = undefined;

  const piece = board[data.from.y][data.from.x];

  const colorTurn = colorToMove.get(roomId) || "white";

  if (colorTurn === "white" && ws !== room?.white) return;
  if (colorTurn === "black" && ws !== room?.black) return;

  if (
    validateMove(
      piece,
      colorTurn,
      board,
      data.from,
      data.to,
      data.promoteTo
    ) === "invalid"
  )
    return;

  if (isLegalMove(board, data.from, data.to, colorTurn)) {
    movePiece(board, data.from, data.to);
    colorToMove.set(roomId, colorTurn === "white" ? "black" : "white");
    sendBoard(roomId);
  }
}

export function sendBoard(roomId: number) {
  const room = rooms.get(roomId);
  const board = chessBoards.get(roomId);
  if (board) {
    if (room?.black) {
      send(room?.black, "board", { board });
    }
    if (room?.white) {
      send(room?.white, "board", { board });
    }
  }
}

export function getNewChessBoard(): ChessBoard {
  return [
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ];
}
