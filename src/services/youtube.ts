// src/services/youtube.ts

/**
 * Minimal helpers for parsing and validating YouTube URLs.
 * Keep implementation dependency-free and resilient to extra params.
 */

export function extractVideoId(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    // youtu.be short links
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '')
      return id || null
    }
    // youtube.com watch?v=ID or /embed/ID
    if (u.hostname.endsWith('youtube.com') || u.hostname.endsWith('youtube-nocookie.com')) {
      // watch?v=...
      if (u.searchParams.has('v')) return u.searchParams.get('v')
      // /embed/{id} or /v/{id}
      const m = u.pathname.match(/\/(embed|v)\/([A-Za-z0-9_-]{1,})/)
      if (m && m[2]) return m[2]
    }
    return null
  } catch (e) {
    // fallback: try regex extraction
    const re = /(?:v=|\/)([A-Za-z0-9_-]{11})(?:$|&|\/)/
    const match = url.match(re)
    return match ? match[1] : null
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const id = extractVideoId(url)
  // Basic validation: 11-char id is typical but some sources vary — accept if non-empty
  return Boolean(id)
}

export function normalizeYouTubeUrl(url: string): string | null {
  const id = extractVideoId(url)
  if (!id) return null
  return `https://www.youtube.com/watch?v=${id}`
}
