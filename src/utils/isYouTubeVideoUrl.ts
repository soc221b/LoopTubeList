export function getYouTubeVideoId(u: string): string | null {
  try {
    const parsed = new URL(u.startsWith('http') ? u : `https://${u}`);
    const host = parsed.hostname.toLowerCase();
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '');
      return id || null;
    }
    if (host.endsWith('youtube.com')) {
      const p = parsed.pathname;
      if (p === '/watch') {
        const v = parsed.searchParams.get('v');
        return v || null;
      }
      if (p.startsWith('/shorts/')) {
        const id = p.replace('/shorts/', '');
        return id || null;
      }
      if (p.startsWith('/embed/')) {
        const id = p.replace('/embed/', '');
        return id || null;
      }
      return null;
    }
    return null;
  } catch {
    // final attempt: regex search within string for common id patterns
    try {
      const m = u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/i);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }
}

export async function isYouTubeVideoUrl(
  u: string,
  options?: { useApi?: boolean; apiKey?: string },
  fetchWithDedupe?: (key: string, fetcher: () => Promise<any>, intervalMs?: number) => Promise<any>,
): Promise<boolean> {
  try {
    const videoId = getYouTubeVideoId(u);
    if (!videoId) return false;

    // First try oEmbed (no API key required)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`;
      try {
        // use provided fetchWithDedupe or module default
        let fetchFn = fetchWithDedupe;
        if (!fetchFn) {
          const mod = await import('@/utils/fetchWithDedupe');
          if (mod.createFetchWithDedupe) {
            const inst = mod.createFetchWithDedupe();
            fetchFn = inst.fetchWithDedupe;
          } else {
            fetchFn = mod.fetchWithDedupe;
          }
        }
        const key = `oembed:${videoId}`;
        const data = await fetchFn(key, () => fetch(oembedUrl).then((r) => r.json()), 1000);
        if (data) return true;
      } catch {
        const res = await fetch(oembedUrl);
        if (res.ok) return true;
      }
    } catch {}

    // Fallback to YouTube Data API if requested
    if (options?.useApi && options.apiKey) {
      try {
        const id = videoId;
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=id&id=${encodeURIComponent(id!)}&key=${encodeURIComponent(
          options.apiKey,
        )}`;
        const res = await fetch(apiUrl);
        if (!res.ok) return false;
        const data = await res.json();
        return Array.isArray(data.items) && data.items.length > 0;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  }
}
