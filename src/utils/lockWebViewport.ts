/**
 * Lock viewport on web so flex:1 fills the screen (no white gap / bounce scroll).
 * No-op on native — native already uses full window via Yoga.
 */

import { Platform } from 'react-native';

const VIEWPORT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap');

  html, body, #root {
    height: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    font-family: 'Fredoka', 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  }
  body {
    position: fixed !important;
    inset: 0 !important;
    overscroll-behavior: none !important;
    touch-action: none !important;
    background-color: #3B5BDB !important;
  }
  #root {
    display: flex !important;
    flex-direction: column !important;
  }
  * {
    font-family: 'Fredoka', 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
`;

let injected = false;

export function lockWebViewport(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || injected) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-viewport-lock', 'true');
  style.textContent = VIEWPORT_CSS;
  document.head.appendChild(style);
  injected = true;
}
