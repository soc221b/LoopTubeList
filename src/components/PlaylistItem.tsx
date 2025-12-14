import React from "react";

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
  playersRef,
  tryCreatePlayer,
  markReviewed,
  resetSchedule,
  remove,
}: {
  v: Video;
  setPlayingId: (id: string | null) => void;
  playersRef: React.MutableRefObject<Record<string, any>>;
  tryCreatePlayer: (id: string) => void;
  markReviewed: (id: string) => void;
  resetSchedule: (id: string) => void;
  remove: (id: string) => void;
}) {
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
            {v.title}
          </a>
          <div style={{ fontSize: 12, color: "#444" }}>
            Reviews: {v.reviewCount} • Next: {new Date(v.nextReview).toLocaleString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => {
              setPlayingId(v.id);
              if (v.youtubeId) {
                const main = playersRef.current.main;
                if (main) {
                  try {
                    main.loadVideoById && main.loadVideoById(v.youtubeId);
                    (window as any).__ytPlayers = (window as any).__ytPlayers || {};
                    (window as any).__ytPlayers[v.youtubeId] = main;
                    main.playVideo && main.playVideo();
                  } catch {}
                } else {
                  tryCreatePlayer(v.youtubeId);
                }
              }
            }}
            aria-label="Play"
            title="Play"
          >
            ▶
          </button>
          <button onClick={() => markReviewed(v.id)} title="Mark reviewed">
            Reviewed
          </button>
          <button onClick={() => resetSchedule(v.id)} title="Reset schedule" disabled={v.reviewCount === 0}>
            Reset
          </button>
          <button onClick={() => remove(v.id)} style={{ color: "crimson" }}>
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
