import { cloneBoard } from "../helpers/board";
import { getPieceType, getPieceColor } from "../helpers/piece";
import { ChessBoard, gameInfos } from "../socket/handlers/gamePlay";
import { isInCheck } from "./check";
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
} from "./moves";

// Helper function to find roomId by board
function findRoomIdByBoard(board: ChessBoard): number | undefined {
  for (const [roomId, gameInfo] of gameInfos.entries()) {
    if (gameInfo.board === board) {
      return roomId;
    }
  }
  return undefined;
}

export function isLegalMove(
  board: ChessBoard,
  from: { x: number; y: number },
  to: { x: number; y: number },
  turn: "white" | "black"
): boolean {
  const piece = board[from.y][from.x];
  if (!piece) return false;

  // 1. Must be pseudo-legal
  const roomId = findRoomIdByBoard(board); // Need to find roomId to pass to getPseudoMoves
  const pseudoMoves = getPseudoMoves(board, from, roomId);
  if (!pseudoMoves.some((m) => m.x === to.x && m.y === to.y)) {
    return false;
  }

  // 2. Simulate move
  const next = cloneBoard(board);
  next[to.y][to.x] = piece;
  next[from.y][from.x] = null;

  // 3. King safety
  return !isInCheck(next, turn);
}

function getPseudoMoves(
  board: ChessBoard,
  from: { x: number; y: number },
  roomId?: number
): { x: number; y: number }[] {
  const piece = getPieceType(board[from.y][from.x]);
  switch (piece) {
    case "pawn":
      return pawnMoves(board, from, roomId);
    case "rook":
      return rookMoves(board, from);
    case "bishop":
      return bishopMoves(board, from);
    case "queen":
      return queenMoves(board, from);
    case "knight":
      return knightMoves(board, from);
    case "king":
      return kingMoves(board, from, roomId);
    default:
      return [];
  }
}

export function movePiece(
  board: ChessBoard,
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const piece = board[from.y][from.x];
  if (!piece) return;

  // Handle en passant capture
  if (
    piece[1].toLowerCase() === "p" &&
    to.x !== from.x &&
    board[to.y][to.x] === null
  ) {
    // This is an en passant capture
    const capturedPawnY = from.y; // The captured pawn is on the same rank as the original pawn
    board[capturedPawnY][to.x] = null; // Remove the captured pawn
  }

  // Handle castling
  if (piece[1].toLowerCase() === "k" && Math.abs(to.x - from.x) === 2) {
    // This is a castling move
    if (to.x > from.x) {
      // Kingside castling
      // Move the rook from h-file to f-file
      const rook = board[from.y][7];
      if (rook) {
        board[from.y][5] = rook; // f-file
        board[from.y][7] = null;
      }
    } else {
      // Queenside castling
      // Move the rook from a-file to d-file
      const rook = board[from.y][0];
      if (rook) {
        board[from.y][3] = rook; // d-file
        board[from.y][0] = null;
      }
    }
  }

  board[to.y][to.x] = piece;
  board[from.y][from.x] = null;
}
