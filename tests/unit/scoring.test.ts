import { describe, it, expect } from 'vitest'
import { sortByPriority } from '../../../src/services/scoring'

const now = new Date()
const tenDays = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000)

describe('scoring.sortByPriority', () => {
  it('orders never-watched first, then older, then newer', () => {
    const videos = [
      { id: 'a', source_url: 'u', last_watched_at: now.toISOString() },
      { id: 'b', source_url: 'u', last_watched_at: tenDays.toISOString() },
      { id: 'c', source_url: 'u', last_watched_at: null },
      { id: 'd', source_url: 'u', last_watched_at: oneDay.toISOString() }
    ]
    const sorted = sortByPriority(videos as any)
    const ids = sorted.map((v) => v.id)
    // expected: c (never), b (10 days), d (1 day), a (now)
    expect(ids).toEqual(['c', 'b', 'd', 'a'])
  })
})
