import React from 'react'
import { render, screen } from '@testing-library/react'
import Player from '../../src/components/Player'
import { saveWatchRecord, removeWatchRecord } from '../../src/lib/persistence'

describe('Player resume behavior', () => {
  it('uses persisted start position when available', () => {
    // set record for the extracted id dQw4w9WgXcQ
    saveWatchRecord('dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', last_position_seconds: 45, last_watched_at: new Date().toISOString() })
    const v = { id: '1', source_url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Sample' }
    render(<Player video={v as any} />)
    const iframe = screen.getByTitle(/Sample/) as HTMLIFrameElement
    expect(iframe.src).toContain('start=45')
    removeWatchRecord('dQw4w9WgXcQ')
  })
})
