import { describe, it, expect, beforeEach } from 'vitest'
import { saveWatchRecord, getWatchRecord, removeWatchRecord, listAllWatchRecords, clearAllData } from '../../src/lib/persistence'

// Simple localStorage polyfill for node test env
beforeEach(() => {
  const store: Record<string, string> = {}
  globalThis.localStorage = {
    getItem(key: string) { return store[key] ?? null },
    setItem(key: string, value: string) { store[key] = String(value) },
    removeItem(key: string) { delete store[key] },
    key(i: number) { return Object.keys(store)[i] ?? null },
    get length() { return Object.keys(store).length }
  } as any
  // clear any keys
  clearAllData()
})

describe('persistence.watchRecord', () => {
  it('saves and retrieves a watch record', () => {
    saveWatchRecord('vid1', { last_position_seconds: 42, last_watched_at: '2020-01-01T00:00:00Z' })
    const r = getWatchRecord('vid1')
    expect(r).not.toBeNull()
    expect(r!.videoId).toBe('vid1')
    expect(r!.last_position_seconds).toBe(42)
  })

  it('lists all watch records', () => {
    saveWatchRecord('v1', { last_position_seconds: 1, last_watched_at: '2020-01-01T00:00:00Z' })
    saveWatchRecord('v2', { last_position_seconds: 2, last_watched_at: '2020-02-01T00:00:00Z' })
    const all = listAllWatchRecords()
    expect(all.length).toBe(2)
    const ids = all.map(r => r.videoId).sort()
    expect(ids).toEqual(['v1','v2'])
  })

  it('removes a watch record', () => {
    saveWatchRecord('rm', { last_position_seconds: 5, last_watched_at: '2021-01-01T00:00:00Z' })
    expect(getWatchRecord('rm')).not.toBeNull()
    removeWatchRecord('rm')
    expect(getWatchRecord('rm')).toBeNull()
  })
})
