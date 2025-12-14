import React from "react";

export default function VideoPlayer({
  playingId,
}: {
  playingId: string | null;
}) {
  return (
    <div style={{ marginBottom: 12, display: playingId ? undefined : "none" }}>
      <iframe
        data-testid="player-iframe"
        id={`player-iframe`}
        title={`player-iframe`}
        src={`https://www.youtube.com/embed/?enablejsapi=1`}
        width={560}
        height={315}
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}
