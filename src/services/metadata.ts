/**
 * Minimal metadata fetcher with oEmbed fallback
 */

export type Metadata = {
  title?: string
  author_name?: string
  thumbnail_url?: string
  provider_name?: string
  url?: string
}

export async function fetchMetadata(url: string): Promise<Metadata> {
  try {
    // Try generic noembed service
    const noembed = `https://noembed.com/embed?url=${encodeURIComponent(url)}`
    const r = await fetch(noembed)
    if (r.ok) {
      const j = await r.json()
      return {
        title: j.title,
        author_name: j.author_name,
        thumbnail_url: j.thumbnail_url,
        provider_name: j.provider_name,
        url: j.url || url,
      }
    }
  } catch (e) {
    // continue to fallback
  }
  // Fallback: return minimal metadata
  return { title: undefined, url }
}
