export type WatchStatus = 'not_watched' | 'in_progress' | 'watched'

export interface Video {
  id: string
  source_url: string
  title?: string
  thumbnail_url?: string
  duration_seconds?: number
  last_watched_at?: string | null // ISO datetime or null
  last_watched_position_seconds?: number
  watch_status?: WatchStatus
}
