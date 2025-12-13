export function getYouTubeVideoId(u: string): string | null {
  try {
    const parsed = new URL(u.startsWith("http") ? u : `https://${u}`);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "");
      return id || null;
    }
    if (host.endsWith("youtube.com")) {
      const p = parsed.pathname;
      if (p === "/watch") {
        const v = parsed.searchParams.get("v");
        return v || null;
      }
      if (p.startsWith("/shorts/")) {
        const id = p.replace("/shorts/", "");
        return id || null;
      }
      if (p.startsWith("/embed/")) {
        const id = p.replace("/embed/", "");
        return id || null;
      }
      return null;
    }
    return null;
  } catch {
    // final attempt: regex search within string for common id patterns
    try {
      const m = u.match(
        /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/i,
      );
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }
}

export function isYouTubeVideoUrl(u: string): boolean {
  // Synchronous check: only validate URL format and whether it contains a video id
  try {
    const id = getYouTubeVideoId(u);
    return !!id;
  } catch {
    return false;
  }
}

// keep helper to extract id publicly
