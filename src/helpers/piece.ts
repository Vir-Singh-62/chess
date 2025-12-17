import { ChessBoard, Piece } from "../socket/handlers/gamePlay";

export function getPieceType(piece: Piece) {
  if (piece === null) return "none";
  switch (piece[1].toLowerCase()) {
    case "p":
      return "pawn";
    case "n":
      return "knight";
    case "b":
      return "bishop";
    case "r":
      return "rook";
    case "q":
      return "queen";
    case "k":
      return "king";
    default:
      return "none";
  }
}

export function getPieceColor(piece: Piece) {
  if (piece === null) return "none";
  return piece.startsWith("w") ? "white" : "black";
}

export function hasPiece(
  x: number,
  y: number,
  board: ChessBoard
): { available: boolean; color: "white" | "black" | "none"; piece: Piece } {
  const piece = board[y][x];

  if (piece && piece.startsWith("w"))
    return { available: false, color: getPieceColor(piece), piece };
  if (piece && piece.startsWith("b"))
    return { available: false, color: getPieceColor(piece), piece };

  return { available: true, color: "none", piece: null };
}
