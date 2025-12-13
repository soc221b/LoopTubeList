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

const localOembedCache = new Map<string, any>();
const localInFlight = new Map<string, Promise<boolean>>();

export function clearOembedCache() {
  try { localOembedCache.clear(); } catch {}
  try { localInFlight.clear(); } catch {}
}

export function getCachedOembed(videoId: string) {
  try { return localOembedCache.get(videoId); } catch { return undefined; }
}

export async function isYouTubeVideoUrl(
  u: string,
  options?: { useApi?: boolean; apiKey?: string; checkRemote?: boolean },
): Promise<boolean> {
  try {
    const videoId = getYouTubeVideoId(u);
    if (!videoId) return false;

    // If caller only wants format check, skip remote validation
    if (options && options.checkRemote === false) return true;

    // Try oEmbed first (no API key required)
    const data = await fetchOembedForVideo(videoId, u);
    if (data) return true;

    // Fallback to YouTube Data API if requested
    if (options?.useApi && options.apiKey) {
      try {
        const id = videoId;
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=id&id=${encodeURIComponent(id!)}&key=${encodeURIComponent(
          options.apiKey,
        )}`;
        const res = await fetch(apiUrl);
        if (!res.ok) return false;
        const json = await res.json();
        return Array.isArray(json.items) && json.items.length > 0;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function fetchOembedForVideo(videoId: string, u: string): Promise<any | null> {
  // quick cache
  if (localOembedCache.has(videoId)) return localOembedCache.get(videoId);
  if (localInFlight.has(videoId)) return await localInFlight.get(videoId) ? localOembedCache.get(videoId) : null;

  const run = (async () => {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        try { localOembedCache.set(videoId, data); } catch {}
        return data;
      }
      return null;
    } catch {
      return null;
    }
  })();

  // store a boolean Promise in localInFlight to signal in-flight; also set cache when done
  const inFlight = run.then((d) => !!d);
  localInFlight.set(videoId, inFlight);
  try {
    const data = await run;
    return data;
  } finally {
    localInFlight.delete(videoId);
  }
}
