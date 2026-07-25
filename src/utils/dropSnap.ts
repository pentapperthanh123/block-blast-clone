import type { BlockShape, Position } from '../types';
import type { BoardLayout } from '../components/game/GameBoard';
import { BOARD_BORDER_PAD } from '../components/game/GameBoard';

export function computeDropSnapPage(
  layout: BoardLayout,
  origin: Position,
  block: BlockShape,
  cellVisual: number,
  liftRatio: number,
): { pageX: number; pageY: number } {
  const cols = block.shape[0]?.length ?? 0;
  const rows = block.shape.length;
  const width = cols * cellVisual;
  const height = rows * cellVisual;
  const innerX = layout.x + BOARD_BORDER_PAD;
  const innerY = layout.y + BOARD_BORDER_PAD;

  return {
    pageX: innerX + origin.col * layout.cellSize + width / 2,
    pageY: innerY + origin.row * layout.cellSize + height / 2 + cellVisual * liftRatio,
  };
}
