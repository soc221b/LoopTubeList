"use client";

import React, { useEffect, useRef, useState } from 'react';

export type PlaylistPlayerProps = {
  playlistId: string;
  width?: number | string;
  height?: number | string;
  onReady?: () => void;
  onError?: (err: any) => void;
};

function loadYouTubeIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).YT && (window as any).YT.Player) return resolve();

    const existing = document.getElementById('youtube-iframe-api');
    if (existing) {
      // wait for the API to call the ready callback
      const check = () => {
        if ((window as any).YT && (window as any).YT.Player) resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }

    const script = document.createElement('script');
    script.id = 'youtube-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    (window as any).onYouTubeIframeAPIReady = () => resolve();
    document.body.appendChild(script);
  });
}

export default function PlaylistPlayer({
  playlistId,
  width = '100%',
  height = 360,
  onReady,
  onError,
}: PlaylistPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let readyTimeout: number | undefined;

    async function init() {
      try {
        await loadYouTubeIframeApi();

        if (!mounted || !containerRef.current) return;

        // Create a new player inside the container
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          height: typeof height === 'number' ? String(height) : height,
          width: typeof width === 'number' ? String(width) : width,
          playerVars: {
            listType: 'playlist',
            list: playlistId,
            autoplay: 1,
            // modestbranding: 1,
          },
          events: {
            onReady: () => {
              if (!mounted) return;
              setLoading(false);
              if (onReady) onReady();
              if (readyTimeout) window.clearTimeout(readyTimeout);
            },
            onError: (e: any) => {
              if (!mounted) return;
              setLoading(false);
              if (onError) onError(e);
            },
          },
        });

        // If player doesn't become ready within 8s, call onError
        readyTimeout = window.setTimeout(() => {
          if (loading && playerRef.current) {
            setLoading(false);
            if (onError) onError(new Error('Player did not become ready within timeout'));
          }
        }, 8000);
      } catch (err) {
        setLoading(false);
        if (onError) onError(err);
      }
    }

    init();

    return () => {
      mounted = false;
      if (readyTimeout) window.clearTimeout(readyTimeout);
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (e) {
        // ignore
      }
    };
  }, [playlistId]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
      />
      {loading && <div className="mt-2 text-sm text-zinc-600">Loading player…</div>}
    </div>
  );
}
