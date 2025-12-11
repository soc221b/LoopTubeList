import { Video } from '../types/video'

// Simple scoring: videos with older last_watched_at get higher priority (appear first)
// last_watched_at === null or undefined means never watched → treated as oldest (highest priority)
export function score(video: Video): number {
  if (!video.last_watched_at) return 0
  const t = Date.parse(video.last_watched_at)
  return t || 0
}

export function sortByPriority(videos: Video[]): Video[] {
  return videos.slice().sort((a, b) => {
    const ta = a.last_watched_at ? Date.parse(a.last_watched_at) : 0
    const tb = b.last_watched_at ? Date.parse(b.last_watched_at) : 0
    // ascending: older timestamps (smaller) first
    return ta - tb
  })
}
