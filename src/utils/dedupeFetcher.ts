const promises = new Map<string, { ts: number; p: Promise<any> }>();

export async function fetchWithDedupe<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  intervalMs = 1000,
): Promise<T> {
  const now = Date.now();
  const existing = promises.get(key);
  if (existing && now - existing.ts < intervalMs) {
    return existing.p as Promise<T>;
  }
  const p = (async () => {
    try {
      const r = await fetcher();
      return r;
    } finally {
      // keep in cache until interval elapses
      setTimeout(() => {
        const cur = promises.get(key);
        if (cur && cur.p === p) promises.delete(key);
      }, intervalMs);
    }
  })();
  promises.set(key, { ts: now, p });
  return p;
}
