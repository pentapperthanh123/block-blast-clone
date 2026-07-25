/**
 * App navigation store — Loading → Home → Classic
 */

import { createWithEqualityFn } from 'zustand/traditional';
import type { AppRoute } from '../types';

interface AppStore {
  route: AppRoute;
  dailyStreak: number;
  setRoute: (route: AppRoute) => void;
  finishLoading: () => void;
  startClassic: () => void;
  goHome: () => void;
}

export const useAppStore = createWithEqualityFn<AppStore>((set) => ({
  route: 'loading',
  dailyStreak: 1,
  setRoute: (route) => set({ route }),
  finishLoading: () => set({ route: 'home' }),
  startClassic: () => set({ route: 'classic' }),
  goHome: () => set({ route: 'home' }),
}));
