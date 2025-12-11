import React, { useState } from 'react'
import { isValidYouTubeUrl, normalizeYouTubeUrl } from '../services/youtube'

type Props = {
  onAdd: (url: string) => void
}

export default function AddVideoForm({ onAdd }: Props) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube link')
      return
    }
    const normalized = normalizeYouTubeUrl(url)
    if (!normalized) {
      setError('Could not normalize URL')
      return
    }
    onAdd(normalized)
    setUrl('')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center" data-testid="add-video-form">
      <input
        aria-label="YouTube URL"
        className="flex-1 rounded border px-3 py-2"
        placeholder="Paste YouTube link"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" aria-label="Add">
        Add
      </button>
      {error ? <div role="alert" className="text-sm text-red-600">{error}</div> : null}
    </form>
  )
}
