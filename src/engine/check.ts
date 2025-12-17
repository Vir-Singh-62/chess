import { ChessBoard } from "../socket/handlers/gamePlay";
import { isSquareAttacked } from "./attack";

export function isInCheck(board: ChessBoard, color: "white" | "black") {
  const king = findKing(board, color);
  return isSquareAttacked(board, king!, color === "white" ? "black" : "white");
}

export function findKing(board: ChessBoard, color: "white" | "black") {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] === (color === "white" ? "wk" : "bk")) {
        return { x, y };
      }
    }
  }
  return null;
}
