/**
 * Color helpers for ghost previews and UI overlays.
 */

export function withOpacity(color: string, alpha: number): string {
  const clamped = Math.min(1, Math.max(0, alpha));

  if (color.startsWith('rgba(')) {
    const parts = color.slice(5, -1).split(',');
    if (parts.length >= 3) {
      return `rgba(${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}, ${clamped})`;
    }
  }

  if (color.startsWith('rgb(')) {
    const parts = color.slice(4, -1).split(',');
    if (parts.length >= 3) {
      return `rgba(${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}, ${clamped})`;
    }
  }

  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamped})`;
}
