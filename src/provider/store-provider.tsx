'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';
import { createRunStore, type RunState, type RunStore } from '@/store';
import type { RunData } from '@/types';

export const StoreContext = createContext<RunStore | null>(null);

export interface StoreProviderProps {
  children: ReactNode;
  initialRuns?: RunData[];
}

export const StoreProvider = ({
  children,
  initialRuns = [],
}: StoreProviderProps) => {
  const storeRef = useRef<RunStore>(null);
  if (!storeRef.current) {
    storeRef.current = createRunStore({
      runs: initialRuns,
      lastRun: initialRuns.length > 0 ? initialRuns[0] : null,
    });
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export function useRunStore<T>(selector: (state: RunState) => T): T {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRunStore must be used within StoreProvider');
  }
  return useStore(context, selector);
}
