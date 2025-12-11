import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import VideoItem from '../../src/components/VideoItem'

describe('VideoItem', () => {
  const sample = {
    id: 'vid1',
    source_url: 'https://youtu.be/abc123xyz01',
    title: 'Sample Video',
    thumbnail_url: 'https://i.example.com/thumb.jpg',
    duration_seconds: 125,
    watch_status: 'in_progress'
  }

  it('renders title, thumbnail, duration and status', () => {
    render(<VideoItem video={sample as any} />)
    expect(screen.getByText('Sample Video')).toBeTruthy()
    const img = screen.getByAltText('Sample Video thumbnail') as HTMLImageElement
    expect(img.src).toBe('https://i.example.com/thumb.jpg')
    expect(screen.getByText('2:05')).toBeTruthy()
    expect(screen.getByLabelText('status').textContent).toBe('in_progress')
  })

  it('calls onSelect and onRemove callbacks', () => {
    const onSelect = vi.fn()
    const onRemove = vi.fn()
    render(<VideoItem video={sample as any} onSelect={onSelect} onRemove={onRemove} />)
    fireEvent.click(screen.getByLabelText('select'))
    fireEvent.click(screen.getByLabelText('remove'))
    expect(onSelect).toHaveBeenCalledWith('vid1')
    expect(onRemove).toHaveBeenCalledWith('vid1')
  })
})
