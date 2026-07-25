/**
 * Helper to format scores as plain numbers without separators (e.g. 1421312).
 * Returns raw number string for clean display.
 */
export function formatScore(score: number | null | undefined): string {
  if (score == null || isNaN(score)) return '0';
  return score.toString();
}
