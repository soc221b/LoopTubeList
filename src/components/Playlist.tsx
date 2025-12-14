import React from "react";
import AddVideoForm from "@/components/AddVideoForm";
import PlaylistItem from "./PlaylistItem";
import { usePlaylist, usePlaylistDispatch } from "@/PlaylistContext";
import { computeNextReview } from "@/App";

export default function Playlist({
  playersRef,
  setPlayingId,
  tryCreatePlayer,
}: {
  playersRef: React.MutableRefObject<Record<string, any>>;
  setPlayingId: (id: string | null) => void;
  tryCreatePlayer: (id: string) => void;
}) {
  const { list } = usePlaylist();
  const dispatch = usePlaylistDispatch();

  const sorted = [...list].sort((a, b) => a.nextReview - b.nextReview);

  return (
    <section>
      <h2>Playlist ({list.length})</h2>

      {/* Add video form moved inside playlist */}
      <div style={{ marginBottom: 16 }}>
        <AddVideoForm
          exists={(id) => list.some((item) => item.youtubeId === id)}
          onAdd={async ({ url: rawUrl, youtubeId, title }) => {
            if (!youtubeId)
              return {
                success: false,
                error: "Only YouTube video URLs are supported.",
              };
            if (list.some((item) => item.youtubeId === youtubeId)) {
              return { success: false, error: "Video already in playlist." };
            }
            const v = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
              youtubeId,
              title,
              url: rawUrl,
              createdAt: Date.now(),
              reviewCount: 0,
              nextReview: computeNextReview(0),
            };
            dispatch({ type: "add", payload: v });
            return { success: true };
          }}
        />
      </div>

      {sorted.length === 0 && <p>No videos yet. Add one above.</p>}

      <ul role="list" aria-label="Playlist" style={{ listStyle: "none", padding: 0 }}>
        {sorted.map((v) => (
          <PlaylistItem
            key={v.id}
            v={v}
            setPlayingId={setPlayingId}
            playersRef={playersRef}
            tryCreatePlayer={tryCreatePlayer}
          />
        ))}
      </ul>
    </section>
  );
}
