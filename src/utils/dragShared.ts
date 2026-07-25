/**
 * Drag finger position on the UI thread — avoids Zustand updates every frame.
 */
import { makeMutable } from 'react-native-reanimated';

export const dragPageX = makeMutable(0);
export const dragPageY = makeMutable(0);
export const dragActive = makeMutable(0);
export const dragIndex = makeMutable(-1);
export const dragSnapScale = makeMutable(1);

// Ghost preview UI-thread state
export const ghostRow = makeMutable(-999);
export const ghostCol = makeMutable(-999);
export const ghostValid = makeMutable(0);
export const ghostColor = makeMutable('');
