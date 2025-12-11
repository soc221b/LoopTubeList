import { describe, it, expect } from 'vitest'
import { saveWatchProgress } from '../../src/hooks/useWatchProgress'
import { getWatchRecord, removeWatchRecord } from '../../src/lib/persistence'

describe('useWatchProgress saveWatchProgress', () => {
  it('saves a watch record and can retrieve it', () => {
    saveWatchProgress('test-video-1', 42)
    const r = getWatchRecord('test-video-1')
    expect(r).not.toBeNull()
    expect(r?.videoId).toBe('test-video-1')
    expect(r?.last_position_seconds).toBe(42)
    // cleanup
    removeWatchRecord('test-video-1')
  })
})
