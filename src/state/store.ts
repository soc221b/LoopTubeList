import create from 'zustand'
import type { Video } from '../types/video'
import type { Playlist } from '../types/playlist'
import { getWatchRecord, saveWatchRecord, removeWatchRecord } from '../lib/persistence'

type StoreState = {
  playlists: Record<string, Playlist>
  videos: Record<string, Video>
  selectedVideoId?: string | null
  addVideo: (v: Video, playlistId?: string) => void
  removeVideo: (id: string) => void
  selectVideo: (id: string | null) => void
  setWatchProgress: (videoId: string, seconds: number) => void
}

export const useStore = create<StoreState>((set) => ({
  playlists: {},
  videos: {},
  selectedVideoId: null,
  addVideo: (v) => {
    const record = getWatchRecord(v.id)
    const merged = { ...v, last_watched_at: record?.last_watched_at ?? (v as any).last_watched_at, last_watched_position_seconds: record?.last_position_seconds ?? (v as any).last_watched_position_seconds }
    set((s) => ({ videos: { ...s.videos, [v.id]: merged }, selectedVideoId: v.id }))
  },
  removeVideo: (id) => {
    removeWatchRecord(id)
    set((s) => {
      const videos = { ...s.videos }
      delete videos[id]
      return { videos, selectedVideoId: s.selectedVideoId === id ? null : s.selectedVideoId }
    })
  },
  selectVideo: (id) => set(() => ({ selectedVideoId: id })),
  setWatchProgress: (videoId, seconds) => {
    saveWatchRecord(videoId, { videoId, last_position_seconds: Math.floor(seconds), last_watched_at: new Date().toISOString() })
    set((s) => {
      const v = s.videos[videoId]
      if (!v) return {}
      const updated = { ...v, last_watched_at: new Date().toISOString(), last_watched_position_seconds: Math.floor(seconds) }
      return { videos: { ...s.videos, [videoId]: updated } }
    })
  }
}))
