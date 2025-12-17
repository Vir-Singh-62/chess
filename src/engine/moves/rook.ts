import { inBounds } from "../../helpers/board";
import { getPieceColor } from "../../helpers/piece";
import { ChessBoard } from "../../socket/handlers/gamePlay";

export function rookMoves(
  board: ChessBoard,
  from: { x: number; y: number }
): { x: number; y: number }[] {
  const moves: { x: number; y: number }[] = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (const [dx, dy] of dirs) {
    let x = from.x + dx;
    let y = from.y + dy;

    while (inBounds(x, y)) {
      if (board[y][x]) {
        if (
          getPieceColor(board[y][x]) !== getPieceColor(board[from.y][from.x])
        ) {
          moves.push({ x, y }); // capture the piece
        }
        break; // break out of the loop if there's a piece of the same color
      }
      moves.push({ x, y }); // add the empty square to the list of moves
      x += dx;
      y += dy;
    }
  }
  return moves;
}
