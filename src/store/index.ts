import { createStore } from 'zustand';
import { type RunData } from '@/types';

export interface RunState {
  runs: RunData[];
  lastRun: RunData | null;
  setRuns: (runs: RunData[]) => void;
}

export type RunStore = ReturnType<typeof createRunStore>;

export const createRunStore = (initState: Partial<RunState> = {}) => {
  return createStore<RunState>((set) => ({
    runs: [],
    lastRun: null,
    ...initState,
    setRuns: (runs: RunData[]) =>
      set({
        runs,
        lastRun: runs.length > 0 ? runs[0] : null,
      }),
  }));
};
