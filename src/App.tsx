import React from 'react'
import Layout from './components/Layout'
import AddVideoForm from './components/AddVideoForm'
import PlaylistView from './components/PlaylistView'
import Player from './components/Player'
import { useStore } from './state/store'
import { extractVideoId } from './services/youtube'

export default function App() {
  const addVideo = useStore((s) => s.addVideo)
  const videos = useStore((s) => Object.values(s.videos))
  const selectedId = useStore((s) => s.selectedVideoId)
  const selectVideo = useStore((s) => s.selectVideo)
  const selectedVideo = videos.find((v) => v.id === selectedId) ?? null

  const handleAdd = (url: string) => {
    const id = extractVideoId(url)
    if (!id) return
    const video = { id, source_url: url }
    addVideo(video as any)
    selectVideo(id)
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Player video={selectedVideo} />
        </div>
        <div>
          <AddVideoForm onAdd={handleAdd} />
          <div className="mt-4">
            <PlaylistView videos={videos} onSelect={(v) => selectVideo(v.id)} onRemove={(v) => useStore.getState().removeVideo(v.id)} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
