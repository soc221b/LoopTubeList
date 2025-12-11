import React from 'react'
import type { Video } from '../types/video'

type Props = {
  video: Video
  onSelect?: (id: string) => void
  onRemove?: (id: string) => void
}

function formatDuration(s?: number) {
  if (!s && s !== 0) return ''
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VideoItem({ video, onSelect, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 p-2 border rounded" data-testid={`video-item-${video.id}`}>
      {video.thumbnail_url ? (
        <img src={video.thumbnail_url} alt={`${video.title || 'video'} thumbnail`} className="w-24 h-14 object-cover rounded" />
      ) : (
        <div className="w-24 h-14 bg-gray-200 rounded" />
      )}
      <div className="flex-1">
        <div className="font-medium text-sm">{video.title || 'Untitled'}</div>
        <div className="text-xs text-gray-500">{formatDuration(video.duration_seconds)}</div>
      </div>
      <div className="text-xs text-gray-600" aria-label="status">{video.watch_status || 'not_watched'}</div>
      <div className="flex gap-2">
        <button onClick={() => onSelect?.(video.id)} aria-label="select" className="text-blue-600">Play</button>
        <button onClick={() => onRemove?.(video.id)} aria-label="remove" className="text-red-600">Remove</button>
      </div>
    </div>
  )
}
