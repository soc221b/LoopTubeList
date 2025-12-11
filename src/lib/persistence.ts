export const SCHEMA_VERSION = 1
const PREFIX = 'ltl' // LoopTubeList

function key(name: string) {
  return `${PREFIX}:v${SCHEMA_VERSION}:${name}`
}

export interface WatchRecord {
  videoId: string
  last_position_seconds: number
  last_watched_at: string // ISO
}

// Minimal sanitization: only allow expected fields on records
function sanitizeWatchRecord(obj: any): WatchRecord {
  return {
    videoId: String(obj.videoId),
    last_position_seconds: Number(obj.last_position_seconds) || 0,
    last_watched_at: String(obj.last_watched_at || new Date().toISOString())
  }
}

export function saveWatchRecord(videoId: string, record: Partial<WatchRecord>) {
  const r = sanitizeWatchRecord({ videoId, ...record })
  localStorage.setItem(key(`watch:${videoId}`), JSON.stringify(r))
}

export function getWatchRecord(videoId: string): WatchRecord | null {
  const raw = localStorage.getItem(key(`watch:${videoId}`))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return sanitizeWatchRecord(parsed)
  } catch (e) {
    return null
  }
}

export function removeWatchRecord(videoId: string) {
  localStorage.removeItem(key(`watch:${videoId}`))
}

export function listAllWatchRecords(): WatchRecord[] {
  const out: WatchRecord[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k) continue
    if (k.startsWith(`${PREFIX}:v${SCHEMA_VERSION}:watch:`)) {
      const raw = localStorage.getItem(k)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        out.push(sanitizeWatchRecord(parsed))
      } catch {
        // skip
      }
    }
  }
  return out
}

export function clearAllData() {
  // only remove keys we manage (schema-aware)
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k) continue
    if (k.startsWith(`${PREFIX}:v`)) toRemove.push(k)
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
}
