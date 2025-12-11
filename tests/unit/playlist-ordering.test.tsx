import React from 'react'
import { render, screen } from '@testing-library/react'
import PlaylistView from '../../src/components/PlaylistView'

describe('PlaylistView ordering', () => {
  it('orders by priority when order=priority', () => {
    const now = new Date()
    const tenDays = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const videos = [
      { id: 'a', source_url: 'u', title: 'A', last_watched_at: now.toISOString() },
      { id: 'b', source_url: 'u', title: 'B', last_watched_at: tenDays.toISOString() },
      { id: 'c', source_url: 'u', title: 'C', last_watched_at: null },
      { id: 'd', source_url: 'u', title: 'D', last_watched_at: oneDay.toISOString() }
    ]

    render(<PlaylistView videos={videos as any} order="priority" />)
    const items = screen.getAllByText(/A|B|C|D/)
    // first text should be C (never watched)
    expect(items[0].textContent).toContain('C')
  })

  it('calls onRemove when confirmed', () => {
    const videos = [{ id: '1', source_url: 'u', title: 'Test' }]
    const onRemove = vi.fn()
    // mock confirm to return true
    const orig = window.confirm
    // @ts-ignore
    window.confirm = () => true
    render(<PlaylistView videos={videos as any} onRemove={onRemove} />)
    const btn = screen.getByLabelText('remove')
    btn.click()
    expect(onRemove).toHaveBeenCalled()
    window.confirm = orig
  })
})