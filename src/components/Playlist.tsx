import React from "react";
import AddVideoForm from "@/components/AddVideoForm";
import PlaylistItem from "./PlaylistItem";
import { usePlaylist } from "@/PlaylistContext";

export default function Playlist({
  playersRef,
  setPlayingId,
  tryCreatePlayer,
}: {
  playersRef: React.RefObject<Record<string, any>>;
  setPlayingId: (id: string | null) => void;
  tryCreatePlayer: (id: string) => void;
}) {
  const { list } = usePlaylist();

  const sorted = [...list].sort((a, b) => a.nextReview - b.nextReview);
  const isEmpty = sorted.length === 0;

  return (
    <section>
      <h2>Playlist ({list.length})</h2>

      {/* Add video form moved inside playlist */}
      <div style={{ marginBottom: 16 }}>
        <AddVideoForm />
      </div>

      {isEmpty ? (
        <p>No videos yet. Add one above.</p>
      ) : (
        <ul role="list" aria-label="Playlist" style={{ listStyle: "none", padding: 0 }}>
          {sorted.map((v) => (
            <PlaylistItem key={v.id} v={v} setPlayingId={setPlayingId} playersRef={playersRef} tryCreatePlayer={tryCreatePlayer} />
          ))}
        </ul>
      )}
    </section>
  );
}
