import React from 'react'
import { extractVideoId } from '../services/youtube'
import { getWatchRecord } from '../lib/persistence'
import type { Video } from '../types/video'

export default function Player({ video }: { video?: Video | null }) {
  if (!video) return <div className="p-4 bg-white rounded">No video selected</div>
  const id = extractVideoId(video.source_url)
  const record = id ? getWatchRecord(id) : null
  const start = record?.last_position_seconds ?? 0
  const embed = id ? `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ''}` : null
  return (
    <div className="bg-black rounded overflow-hidden">
      {embed ? (
        <iframe title={video.title ?? 'player'} src={embed} width="100%" height={360} frameBorder="0" allowFullScreen />
      ) : (
        <div className="p-4 text-white">Cannot play this source</div>
      )}
    </div>
  )
}
