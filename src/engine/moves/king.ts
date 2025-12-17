import { inBounds } from "../../helpers/board";
import { getPieceColor } from "../../helpers/piece";
import { ChessBoard } from "../../socket/handlers/gamePlay";

export function kingMoves(
  board: ChessBoard,
  from: { x: number; y: number }
): { x: number; y: number }[] {
  const moves: { x: number; y: number }[] = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];

  for (const [dx, dy] of dirs) {
    const x = from.x + dx;
    const y = from.y + dy;

    if (inBounds(x, y)) {
      if (board[y][x]) {
        if (
          getPieceColor(board[y][x]) !== getPieceColor(board[from.y][from.x])
        ) {
          moves.push({ x, y }); // capture the piece
        }
        // Kings move only one square, so we don't continue in this direction
      } else {
        moves.push({ x, y }); // add the empty square to the list of moves
      }
    }
  }

  return moves;
}
