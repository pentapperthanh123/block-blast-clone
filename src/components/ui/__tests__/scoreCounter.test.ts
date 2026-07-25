/**
 * Unit: score counter easing reaches target
 */

describe('Score counter easing', () => {
  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  function interpolate(from: number, to: number, t: number) {
    return Math.round(from + (to - from) * easeOutCubic(Math.min(1, Math.max(0, t))));
  }

  it('starts at from and ends at to', () => {
    expect(interpolate(100, 200, 0)).toBe(100);
    expect(interpolate(100, 200, 1)).toBe(200);
  });

  it('moves upward for positive delta', () => {
    const mid = interpolate(0, 100, 0.5);
    expect(mid).toBeGreaterThan(50);
    expect(mid).toBeLessThan(100);
  });
});
