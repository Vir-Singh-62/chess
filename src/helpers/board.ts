import { ChessBoard } from "../socket/handlers/gamePlay";

export function cloneBoard(board: ChessBoard): ChessBoard {
  return board.map((r) => [...r]);
}

export function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}
