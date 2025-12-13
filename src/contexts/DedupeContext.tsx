import React, { createContext, useContext, type ReactNode, useMemo } from 'react';
import { createFetchWithDedupe } from '@/utils/fetchWithDedupe';

type Dedupe = ReturnType<typeof createFetchWithDedupe>;
export const DedupeContext = createContext<Dedupe | null>(null);

export function DedupeProvider({ children }: { children: ReactNode }) {
  const dedupe = useMemo(() => createFetchWithDedupe(), []);
  return (
    <DedupeContext.Provider value={dedupe}>{children}</DedupeContext.Provider>
  );
}

export function useDedupe() {
  const ctx = useContext(DedupeContext);
  if (!ctx) throw new Error('useDedupe must be used within DedupeProvider');
  return ctx;
}
