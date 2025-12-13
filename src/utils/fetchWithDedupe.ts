export function createFetchWithDedupe() {
  const promises = new Map<string, { ts: number; p: Promise<any> }>();
  const results = new Map<string, any>();

  async function fetchWithDedupe<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    intervalMs = 1000,
  ): Promise<T> {
    // If we have a cached successful result, return it for app lifecycle
    if (results.has(key)) {
      return results.get(key) as T;
    }

    const now = Date.now();
    const existing = promises.get(key);
    if (existing && now - existing.ts < intervalMs) {
      return existing.p as Promise<T>;
    }
    const p = (async () => {
      try {
        const r = await fetcher();
        // cache successful result indefinitely for the app lifecycle
        try {
          results.set(key, r);
        } catch {}
        return r;
      } finally {
        // keep in promises cache until interval elapses
        setTimeout(() => {
          const cur = promises.get(key);
          if (cur && cur.p === p) promises.delete(key);
        }, intervalMs);
      }
    })();
    promises.set(key, { ts: now, p });
    return p;
  }

  function clearDedupeCache() {
    promises.clear();
  }
  function clearDedupeResults() {
    results.clear();
  }

  return { fetchWithDedupe, clearDedupeCache, clearDedupeResults };
}

// default instance for backward compatibility
export const defaultDedupe = createFetchWithDedupe();
export const fetchWithDedupe = defaultDedupe.fetchWithDedupe;