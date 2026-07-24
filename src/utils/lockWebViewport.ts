/**
 * Lock viewport on web so flex:1 fills the screen (no white gap / bounce scroll).
 * No-op on native — native already uses full window via Yoga.
 */

import { Platform } from 'react-native';

const VIEWPORT_CSS = `
  html, body, #root {
    height: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
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
