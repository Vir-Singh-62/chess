import { ChessBoard } from "../socket/handlers/gamePlay";

export function isSquareAttacked(
  board: ChessBoard,
  square: { x: number; y: number },
  attackerColor: "white" | "black"
): boolean {
  return false;
}
