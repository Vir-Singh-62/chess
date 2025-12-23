import WebSocket from "ws";
import { parse, send } from "..";
import { getRoomId, rooms } from "./room";
import { validateMove } from "../validator/input";
import { isLegalMove, movePiece } from "../../engine";
import { getPieceColor } from "../../helpers/piece";

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

interface GameInfo {
  board: ChessBoard;
  enPassantTarget: { x: number; y: number } | null;
  whiteKingMoved: boolean;
  blackKingMoved: boolean;
  whiteRookKingsideMoved: boolean;
  whiteRookQueensideMoved: boolean;
  blackRookKingsideMoved: boolean;
  blackRookQueensideMoved: boolean;
}

export const gameInfos = new Map<number, GameInfo>();
export const colorToMove = new Map<number, "white" | "black">();

export function handleMove(ws: WebSocket, raw: string) {
  const data = parse<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    promoteTo?: Piece;
  }>(raw);
  const roomId = getRoomId(ws);
  const room = rooms.get(roomId);
  const gameInfo = gameInfos.get(roomId);
  const board = gameInfo?.board;

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
    // Update game state before making the move
    if (gameInfo) {
      // Handle en passant target
      const piece = board[data.from.y][data.from.x];
      if (
        piece &&
        piece[1].toLowerCase() === "p" &&
        Math.abs(data.to.y - data.from.y) === 2
      ) {
        // Pawn moved two squares, set en passant target
        gameInfo.enPassantTarget = {
          x: data.from.x,
          y: (data.from.y + data.to.y) / 2,
        };
      } else {
        gameInfo.enPassantTarget = null; // Clear en passant target if not a double pawn move
      }

      // Handle castling rights
      if (piece && piece[1].toLowerCase() === "k") {
        // King moved
        if (getPieceColor(piece) === "white") {
          gameInfo.whiteKingMoved = true;
        } else {
          gameInfo.blackKingMoved = true;
        }
      } else if (piece && piece[1].toLowerCase() === "r") {
        // Rook moved
        if (data.from.x === 0) {
          // Queenside rook
          if (getPieceColor(piece) === "white") {
            gameInfo.whiteRookQueensideMoved = true;
          } else {
            gameInfo.blackRookQueensideMoved = true;
          }
        } else if (data.from.x === 7) {
          // Kingside rook
          if (getPieceColor(piece) === "white") {
            gameInfo.whiteRookKingsideMoved = true;
          } else {
            gameInfo.blackRookKingsideMoved = true;
          }
        }
      }
    }

    movePiece(board, data.from, data.to);
    colorToMove.set(roomId, colorTurn === "white" ? "black" : "white");
    sendBoard(roomId);
  }
}

export function sendBoard(roomId: number) {
  const room = rooms.get(roomId);
  const gameInfo = gameInfos.get(roomId);
  const board = gameInfo?.board;
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

export function initializeGame(roomId: number) {
  const board = getNewChessBoard();
  gameInfos.set(roomId, {
    board,
    enPassantTarget: null,
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookKingsideMoved: false,
    whiteRookQueensideMoved: false,
    blackRookKingsideMoved: false,
    blackRookQueensideMoved: false,
  });
  colorToMove.set(roomId, "white");
}
