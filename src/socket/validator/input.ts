import { inBounds } from "../../helpers/board";
import { getPieceColor, getPieceType, hasPiece } from "../../helpers/piece";
import { ChessBoard, Piece } from "../handlers/gamePlay";

export function validateMove(
  piece: Piece,
  player: "white" | "black",
  board: ChessBoard,
  from: { x: number; y: number },
  to: { x: number; y: number },
  promoteTo?: Piece
) {
  if (getPieceColor(piece) !== player) return "invalid"; // wrong player's piece

  if (!inBounds(to.x, to.y) || !inBounds(from.x, from.y)) return "invalid"; // out of bounds

  if (board[from.y][from.x] === null) return "invalid"; // from doesnt have a piece

  if (promoteTo && getPieceColor(promoteTo) !== player) return "invalid"; //promoting to opponents's piece

  if (
    hasPiece(from.x, from.y, board).available && // piece is present
    getPieceType(hasPiece(from.x, from.y, board).piece as Piece) === "pawn" && // the piece is pawn
    promoteTo && // promotion argument is passed
    (getPieceType(promoteTo) === "none" ||
      getPieceType(promoteTo) === "pawn" ||
      getPieceType(promoteTo) === "king") && // illegal promotion (not queen, rook, bishop, or knight)
    ((player === "white" && from.y === 6 && to.y === 7) || // white pawn promotion
      (player === "black" && from.y === 1 && to.y === 0)) // black pawn promotion
  ) {
    return "invalid"; //illegal promotion
  }

  return "valid";
}
