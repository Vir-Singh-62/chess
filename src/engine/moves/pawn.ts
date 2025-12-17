import { inBounds } from "../../helpers/board";
import { getPieceColor } from "../../helpers/piece";
import { ChessBoard } from "../../socket/handlers/gamePlay";

export function pawnMoves(
  board: ChessBoard,
  from: { x: number; y: number }
): { x: number; y: number }[] {
  const moves: { x: number; y: number }[] = [];
  const piece = board[from.y][from.x];
  const pieceColor = getPieceColor(piece);

  // Determine direction based on piece color
  const direction = pieceColor === "white" ? -1 : 1;

  // Move forward one square
  const oneSquareForward = { x: from.x, y: from.y + direction };
  if (
    inBounds(oneSquareForward.x, oneSquareForward.y) &&
    !board[oneSquareForward.y][oneSquareForward.x]
  ) {
    moves.push(oneSquareForward);

    // Move forward two squares from starting position
    const isStartingPosition =
      (pieceColor === "white" && from.y === 6) ||
      (pieceColor === "black" && from.y === 1);
    const twoSquaresForward = { x: from.x, y: from.y + 2 * direction };
    if (
      isStartingPosition &&
      inBounds(twoSquaresForward.x, twoSquaresForward.y) &&
      !board[twoSquaresForward.y][twoSquaresForward.x]
    ) {
      moves.push(twoSquaresForward);
    }
  }

  // Capture diagonally
  const captureDirections = [
    [-1, direction],
    [1, direction],
  ];
  for (const [dx, dy] of captureDirections) {
    const captureX = from.x + dx;
    const captureY = from.y + dy;

    if (inBounds(captureX, captureY)) {
      const targetPiece = board[captureY][captureX];
      if (targetPiece && getPieceColor(targetPiece) !== pieceColor) {
        moves.push({ x: captureX, y: captureY });
      }
    }
  }

  return moves;
}
