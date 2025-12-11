import { describe, it, expect } from 'vitest'
import { extractVideoId, isValidYouTubeUrl, normalizeYouTubeUrl } from '../../src/services/youtube'

describe('youtube helpers', () => {
  it('extracts id from youtube.com watch URL', () => {
    const id = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(id).toBe('dQw4w9WgXcQ')
  })

  it('extracts id from youtu.be short link', () => {
    const id = extractVideoId('https://youtu.be/dQw4w9WgXcQ')
    expect(id).toBe('dQw4w9WgXcQ')
  })

  it('extracts id from embed URL', () => {
    const id = extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(id).toBe('dQw4w9WgXcQ')
  })

  it('returns null for non-youtube URL', () => {
    expect(extractVideoId('https://example.com/watch?v=foo')).toBe(null)
  })

  it('validates youtube urls', () => {
    expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    expect(isValidYouTubeUrl('not a url')).toBe(false)
  })

  it('normalizes to standard watch URL', () => {
    expect(normalizeYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })
})
