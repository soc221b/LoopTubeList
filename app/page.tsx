"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import parsePlaylistId from '../utils/parsePlaylistId';
import PlaylistPlayer from '../components/PlaylistPlayer';

export default function Home() {
  const [input, setInput] = useState('');
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const res = parsePlaylistId(input);
    if (res.ok) {
      setPlaylistId(res.id);
    } else {
      setPlaylistId(null);
      setError(res.error);
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black py-12">
      <main className="w-full max-w-3xl bg-white p-8 shadow-sm">
        <header className="mb-6 flex items-center gap-4">
          <Image src="/next.svg" alt="logo" width={56} height={18} />
          <h1 className="text-xl font-semibold">LoopTubeList — Playlist Player</h1>
        </header>

        <form onSubmit={handleSubmit} className="mb-4">
          <label className="block text-sm font-medium text-zinc-700">YouTube playlist URL or ID</label>
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=PL..."
              className="flex-1 rounded border px-3 py-2"
            />
            <button type="submit" className="rounded bg-black px-4 py-2 text-white">
              Play
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{String(error)}</div>
        )}

        {playlistId ? (
          <div>
            <PlaylistPlayer playlistId={playlistId} height={360} />
          </div>
        ) : (
          <div className="text-sm text-zinc-600">Enter a playlist URL or ID and click Play.</div>
        )}
      </main>
    </div>
  );
}
