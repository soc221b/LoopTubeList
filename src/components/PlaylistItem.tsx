import React from "react";
import { usePlaylistDispatch } from "@/PlaylistContext";
import { computeNextReview } from "@/App";
import { stopIfPlaying } from "@/playerController";

type Video = {
  id: string;
  youtubeId?: string;
  title: string;
  url: string;
  createdAt: number;
  reviewCount: number;
  nextReview: number;
};

export default function PlaylistItem({
  v,
  setPlayingId,
}: {
  v: Video;
  setPlayingId: (id: string | null) => void;
}) {
  const dispatch = usePlaylistDispatch();

  function handlePlay() {
    setPlayingId(v.id);
  }

  function handleReviewed() {
    dispatch({
      type: "reviewed",
      payload: { id: v.id, nextReview: computeNextReview(v.reviewCount + 1) },
    });
    // stop the player immediately if this item is currently playing
    // playerController will do nothing if not playing
    stopIfPlaying(v.id);
    try {
      (window as any).__YT_PLAYER__ &&
        (window as any).__YT_PLAYER__.stopVideo &&
        (window as any).__YT_PLAYER__.stopVideo();
    } catch {}
  }

  function handleReset() {
    dispatch({
      type: "reset",
      payload: { id: v.id, nextReview: computeNextReview(0) },
    });
  }

  function handleRemove() {
    dispatch({ type: "remove", payload: { id: v.id } });
  }

  return (
    <li
      key={v.id}
      style={{
        padding: 12,
        borderRadius: 8,
        background: "white",
        marginBottom: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div style={{ flex: 1 }}>
          <a
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600 }}
          >
            {v.title}
          </a>
          <div style={{ fontSize: 12, color: "#444" }}>
            Reviews: {v.reviewCount} • Next:{" "}
            {new Date(v.nextReview).toLocaleString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handlePlay} aria-label="Play" title="Play">
            ▶
          </button>
          <button onClick={handleReviewed} title="Mark reviewed">
            Reviewed
          </button>
          <button
            onClick={handleReset}
            title="Reset schedule"
            disabled={v.reviewCount === 0}
          >
            Reset
          </button>
          <button onClick={handleRemove} style={{ color: "crimson" }}>
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
