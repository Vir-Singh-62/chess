import { inBounds } from "../../helpers/board";
import { getPieceColor, getPieceType } from "../../helpers/piece";
import { ChessBoard, gameInfos } from "../../socket/handlers/gamePlay";

export function kingMoves(
  board: ChessBoard,
  from: { x: number; y: number },
  roomId?: number
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

  // Castling moves
  if (roomId !== undefined) {
    const gameInfo = gameInfos.get(roomId);
    if (gameInfo) {
      const piece = board[from.y][from.x];
      const pieceColor = getPieceColor(piece);

      // Check if king has moved
      const kingHasMoved =
        pieceColor === "white"
          ? gameInfo.whiteKingMoved
          : gameInfo.blackKingMoved;
      if (kingHasMoved) return moves; // King has moved, can't castle

      // Kingside castling
      if (from.x === 4 && from.y === (pieceColor === "white" ? 7 : 0)) {
        // King is on starting position
        // Kingside: check if rook is in place and path is clear
        if (
          !board[from.y][7] ||
          getPieceType(board[from.y][7]) !== "rook" ||
          getPieceColor(board[from.y][7]) !== pieceColor
        ) {
          // No rook at h-file or wrong color
        } else {
          const rookHasMoved =
            pieceColor === "white"
              ? gameInfo.whiteRookKingsideMoved
              : gameInfo.blackRookKingsideMoved;
          if (!rookHasMoved && !board[from.y][5] && !board[from.y][6]) {
            // Path is clear
            moves.push({ x: 6, y: from.y }); // Kingside castling
          }
        }

        // Queenside castling
        if (
          !board[from.y][0] ||
          getPieceType(board[from.y][0]) !== "rook" ||
          getPieceColor(board[from.y][0]) !== pieceColor
        ) {
          // No rook at a-file or wrong color
        } else {
          const rookHasMoved =
            pieceColor === "white"
              ? gameInfo.whiteRookQueensideMoved
              : gameInfo.blackRookQueensideMoved;
          if (
            !rookHasMoved &&
            !board[from.y][1] &&
            !board[from.y][2] &&
            !board[from.y][3]
          ) {
            // Path is clear
            moves.push({ x: 2, y: from.y }); // Queenside castling
          }
        }
      }
    }
  }

  return moves;
}
