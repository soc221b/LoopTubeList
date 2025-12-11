import React from 'react'
import { render, screen } from '@testing-library/react'
import Player from '../../src/components/Player'
import { saveWatchRecord, removeWatchRecord } from '../../src/lib/persistence'

describe('Player', () => {
  it('shows no video selected', () => {
    render(<Player video={null} />)
    expect(screen.getByText(/No video selected/i)).toBeTruthy()
  })

  it('renders iframe for youtube url and respects saved start position', () => {
    const v = { id: '1', source_url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Sample' }
    // save a watch record for the video id extracted from the URL (dQw4w9WgXcQ)
    saveWatchRecord('dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', last_position_seconds: 30, last_watched_at: new Date().toISOString() })
    render(<Player video={v as any} />)
    const iframe = screen.getByTitle(/Sample/) as HTMLIFrameElement
    expect(iframe.src).toContain('start=30')
    // cleanup
    removeWatchRecord('dQw4w9WgXcQ')
  })
})
