import React from 'react'
import type { Video } from '../types/video'
import { sortByPriority } from '../services/scoring'

export default function PlaylistView({
  videos = [],
  onSelect = () => {},
  onRemove = () => {},
  order = 'priority'
}: {
  videos?: Video[]
  onSelect?: (v: Video) => void
  onRemove?: (v: Video) => void
  order?: 'priority' | 'added'
}) {
  const list = order === 'priority' ? sortByPriority(videos) : videos
  return (
    <div className="space-y-2">
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">No videos in playlist.</p>
      ) : (
        list.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
            <div className="flex items-center gap-3">
              {v.thumbnail_url ? <img src={v.thumbnail_url} alt={`${v.title} thumbnail`} className="w-16 h-9 object-cover" /> : null}
              <div>
                <div className="font-medium">{v.title ?? 'Untitled'}</div>
                <div className="text-xs text-gray-500">{v.duration_seconds ? `${v.duration_seconds}s` : ''}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button aria-label="select" className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => onSelect(v)}>
                Play
              </button>
              <button
                aria-label="remove"
                className="px-2 py-1 bg-red-100 text-red-700 rounded"
                onClick={() => {
                  if (typeof window !== 'undefined' && !window.confirm('Remove video?')) return
                  onRemove(v)
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
