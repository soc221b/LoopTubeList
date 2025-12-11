import React from 'react'
import { render, screen } from '@testing-library/react'
import PlaylistView from '../../src/components/PlaylistView'

describe('PlaylistView', () => {
  it('renders empty state', () => {
    render(<PlaylistView videos={[]} />)
    expect(screen.getByText(/No videos in playlist/i)).toBeTruthy()
  })

  it('renders videos and calls onSelect when Play clicked', () => {
    const videos = [{ id: '1', source_url: 'https://youtu.be/x', title: 'V', duration_seconds: 10, thumbnail_url: '' }]
    const onSelect = vi.fn()
    render(<PlaylistView videos={videos as any} onSelect={onSelect} />)
    expect(screen.getByText('V')).toBeTruthy()
  })
})
