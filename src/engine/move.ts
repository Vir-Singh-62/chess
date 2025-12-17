import { cloneBoard } from "../helpers/board";
import { getPieceType } from "../helpers/piece";
import { ChessBoard } from "../socket/handlers/gamePlay";
import { isInCheck } from "./check";
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
} from "./moves";

export function isLegalMove(
  board: ChessBoard,
  from: { x: number; y: number },
  to: { x: number; y: number },
  turn: "white" | "black"
): boolean {
  const piece = board[from.y][from.x];
  if (!piece) return false;

  // 1. Must be pseudo-legal
  const pseudoMoves = getPseudoMoves(board, from);
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
  from: { x: number; y: number }
): { x: number; y: number }[] {
  const piece = getPieceType(board[from.y][from.x]);
  switch (piece) {
    case "pawn":
      return pawnMoves(board, from);
    case "rook":
      return rookMoves(board, from);
    case "bishop":
      return bishopMoves(board, from);
    case "queen":
      return queenMoves(board, from);
    case "knight":
      return knightMoves(board, from);
    case "king":
      return kingMoves(board, from);
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
  board[to.y][to.x] = piece;
  board[from.y][from.x] = null;
}
