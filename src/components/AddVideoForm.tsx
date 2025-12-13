import React, { useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { isYouTubeVideoUrl, getYouTubeVideoId } from '@/utils/isYouTubeVideoUrl';

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error('not ok'))));
const localInFlight = new Map<string, Promise<any>>();

export default function AddVideoForm({ onAdd, exists }: { onAdd: (payload: { url: string; youtubeId: string; title: string }) => Promise<{ success: boolean; error?: string }>; exists?: (id: string) => boolean; }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const raw = url.trim();
    if (!raw) return;
    if (!isYouTubeVideoUrl(raw)) {
      setError('Only YouTube video URLs are supported.');
      return;
    }
    const youtubeId = getYouTubeVideoId(raw)!;
    const key = `oembed:${youtubeId}`;

    // if already exists in playlist, avoid fetching
    if (exists && exists(youtubeId)) {
      setError('Video already in playlist.');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      // perform fetch directly but update SWR cache; use local in-flight map to dedupe
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(raw)}&format=json`;
      let data: any | null = null;
      try {
        if (localInFlight.has(key)) {
          try {
            await localInFlight.get(key);
            try { data = await mutate(key); } catch {}
          } catch {}
        } else {
          const p = (async () => {
            try {
              const d = await fetcher(oembedUrl);
              // populate SWR cache without revalidation
              try { await mutate(key, d, false); } catch {}
              return d;
            } catch {
              return null;
            }
          })();
          localInFlight.set(key, p);
          try {
            data = await p;
          } finally {
            localInFlight.delete(key);
          }
        }
      } catch {}

      const title = (data && data.title) ? data.title : raw;
      setError(null);
      const res = await onAdd({ url: raw, youtubeId, title });
      if (!res.success) {
        setError(res.error || 'Failed to add');
        inputRef.current?.focus();
        return;
      }
      // reset input and focus
      setUrl('');
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add video form" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label htmlFor="url-input" style={{ position: 'absolute', left: -9999 }}>YouTube URL</label>
      <input
        ref={inputRef}
        id="url-input"
        type="url"
        placeholder="YouTube URL"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(null); }}
        style={{ flex: 1, padding: '8px' }}
        required
        aria-required="true"
        autoFocus
      />
      <button type="submit" style={{ padding: '8px 12px' }} aria-label="Add video">Add</button>
      {error && <div role="alert" style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
      {loading && <div aria-hidden>Loading...</div>}
    </form>
  );
}
