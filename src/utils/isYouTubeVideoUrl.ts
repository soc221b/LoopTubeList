export async function isYouTubeVideoUrl(u: string, options?: { useApi?: boolean; apiKey?: string }): Promise<boolean> {
  try {
    const parsed = new URL(u.startsWith('http') ? u : `https://${u}`);
    const host = parsed.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '');
      if (!id) return false;
      videoId = id;
    } else if (host.endsWith('youtube.com')) {
      const p = parsed.pathname;
      if (p === '/watch') {
        const v = parsed.searchParams.get('v');
        if (!v) return false;
        videoId = v;
      } else if (p.startsWith('/shorts/')) {
        videoId = p.replace('/shorts/', '');
        if (!videoId) return false;
      } else if (p.startsWith('/embed/')) {
        videoId = p.replace('/embed/', '');
        if (!videoId) return false;
      } else {
        return false; // other youtube pages are not video urls
      }
    } else {
      return false;
    }

    // First try oEmbed (no API key required)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) return true;
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
