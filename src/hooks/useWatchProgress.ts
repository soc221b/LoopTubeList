import { useEffect, useRef } from 'react'
import { saveWatchRecord } from '../lib/persistence'

export function saveWatchProgress(videoId: string, seconds: number) {
  try {
    saveWatchRecord(videoId, { last_position_seconds: Math.floor(seconds), last_watched_at: new Date().toISOString() })
  } catch (e) {
    // swallow for now; persistence errors handled in persistence module
    // eslint-disable-next-line no-console
    console.error('saveWatchProgress error', e)
  }
}

export default function useWatchProgress(videoId?: string | null, currentTime?: number) {
  const lastRef = useRef<number | null>(null)
  useEffect(() => {
    if (!videoId) return
    if (typeof currentTime !== 'number') return
    // save when progressed by at least 1 second
    if (lastRef.current === null || Math.abs(currentTime - lastRef.current) >= 1) {
      saveWatchProgress(videoId, currentTime)
      lastRef.current = currentTime
    }
  }, [videoId, currentTime])
}
