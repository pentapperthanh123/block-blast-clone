import {
  GRID_SIZE,
  CELL_SIZE,
  POINTS_PER_BLOCK,
  BLOCK_COLORS,
  MAX_ACTIVE_PIECES,
} from '../index';

describe('Constants', () => {
  it('should have correct grid configuration', () => {
    expect(GRID_SIZE).toBe(8);
    expect(CELL_SIZE).toBe(40);
  });

  it('should have scoring constants', () => {
    expect(POINTS_PER_BLOCK).toBeDefined();
    expect(typeof POINTS_PER_BLOCK).toBe('number');
  });

  it('should have block colors defined', () => {
    expect(BLOCK_COLORS.PURPLE).toBeDefined();
    expect(BLOCK_COLORS.CYAN).toBeDefined();
    expect(BLOCK_COLORS.ORANGE).toBeDefined();
    expect(BLOCK_COLORS.YELLOW).toBeDefined();
    expect(BLOCK_COLORS.GREEN).toBeDefined();
  });

  it('should have max active pieces', () => {
    expect(MAX_ACTIVE_PIECES).toBe(3);
  });
});
