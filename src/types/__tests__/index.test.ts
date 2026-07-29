import type { CellState, Grid, Position, BlockShape, GameState } from '../index';

describe('Type Definitions', () => {
  it('should define CellState correctly', () => {
    const empty: CellState = 0;
    const filled: CellState = 1;
    
    expect(empty).toBe(0);
    expect(filled).toBe(1);
  });

  it('should define Grid as 2D array', () => {
    const grid: Grid = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];
    
    expect(grid).toHaveLength(3);
    expect(grid[1][1]).toBe(1);
  });

  it('should define Position with row and col', () => {
    const position: Position = { row: 3, col: 5 };
    
    expect(position.row).toBe(3);
    expect(position.col).toBe(5);
  });

  it('should define BlockShape structure', () => {
    const block: BlockShape = {
      id: 'test-block',
      shape: [[1, 1], [1, 0]],
      color: '#FF0000',
    };
    
    expect(block.id).toBe('test-block');
    expect(block.shape).toHaveLength(2);
    expect(block.color).toBe('#FF0000');
  });

  it('should define GameState structure', () => {
    const gameState: GameState = {
      grid: [[0]],
      score: 100,
      highScore: 500,
      currentPieces: [],
      isGameOver: false,
      combo: 0,
      movesWithoutClear: 0,
      perfectClears: 0,
      reviveCount: 0,
    };
    
    expect(gameState.score).toBe(100);
    expect(gameState.isGameOver).toBe(false);
  });
});
