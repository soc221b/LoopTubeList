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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            onReady: (event: any) => {
              if (!mounted) return;
              setLoading(false);
              if (onReady) onReady();
              // populate basic metadata when ready. Prefer event.target if available.
              try {
                const playerInstance = (event && event.target) ? event.target : playerRef.current;
                const idx = playerInstance && playerInstance.getPlaylistIndex && playerInstance.getPlaylistIndex();
                const data = playerInstance && playerInstance.getVideoData && playerInstance.getVideoData();
                setCurrentIndex(typeof idx === 'number' ? idx : null);
                setCurrentTitle(data && data.title ? String(data.title) : null);
              } catch (e) {
                // ignore
              }
              if (readyTimeout) window.clearTimeout(readyTimeout);
            },
            onError: (e: any) => {
              if (!mounted) return;
              setLoading(false);
              const msg = mapYouTubeError(e && e.data ? e.data : undefined);
              setErrorMessage(msg);
              if (onError) onError(e);
            },
            onStateChange: (e: any) => {
              // Update play/pause state and metadata when state changes
              try {
                const YT = (window as any).YT;
                if (YT && typeof YT.PlayerState !== 'undefined') {
                  setIsPlaying(e.data === YT.PlayerState.PLAYING);
                }
                if (playerRef.current && typeof playerRef.current.getPlaylistIndex === 'function') {
                  const idx = playerRef.current.getPlaylistIndex();
                  setCurrentIndex(typeof idx === 'number' ? idx : null);
                }
                if (playerRef.current && typeof playerRef.current.getVideoData === 'function') {
                  const data = playerRef.current.getVideoData();
                  setCurrentTitle(data && data.title ? String(data.title) : null);
                }
              } catch (err) {
                // ignore
              }
            },
          },
        });

        // If player doesn't become ready within 8s, call onError
        readyTimeout = window.setTimeout(() => {
          if (loading && playerRef.current) {
            setLoading(false);
            const err = new Error('Player did not become ready within timeout');
            setErrorMessage(err.message);
            if (onError) onError(err);
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

  // Map YouTube iframe API error codes to friendly messages
  function mapYouTubeError(code: any): string {
    if (code == null) return 'An unknown player error occurred.';
    // Known YouTube playlist/video error codes
    switch (Number(code)) {
      case 2:
        return 'The request contained an invalid parameter. Try a different playlist or URL.';
      case 5:
        return 'The requested content cannot be played in the player. It may be an unsupported format.';
      case 100:
        return 'This video was not found. It may have been removed or set to private.';
      case 101:
      case 150:
        return 'This video does not allow embedding.';
      default:
        return `Player error (${String(code)}).`;
    }
  }

  // Keyboard handlers for accessibility: when container is focused
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!playerRef.current) return;
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault();
      try {
        if (isPlaying) playerRef.current.pauseVideo && playerRef.current.pauseVideo();
        else playerRef.current.playVideo && playerRef.current.playVideo();
      } catch (err) {}
    } else if (e.key === 'ArrowRight') {
      try {
        playerRef.current.nextVideo && playerRef.current.nextVideo();
      } catch (err) {}
    } else if (e.key === 'ArrowLeft') {
      try {
        playerRef.current.previousVideo && playerRef.current.previousVideo();
      } catch (err) {}
    }
  }

  // Suggest actions the user can take for specific error codes
  function mapYouTubeActions(code: any) {
    const actions: Array<{ label: string; href?: string; external?: boolean }> = [];
    if (code == null) {
      actions.push({ label: 'Open playlist on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
      return actions;
    }
    switch (Number(code)) {
      case 2:
        actions.push({ label: 'Try a different playlist' });
        actions.push({ label: 'Open playlist on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
        break;
      case 5:
        actions.push({ label: 'View playlist on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
        break;
      case 100:
        actions.push({ label: 'Open playlist on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
        actions.push({ label: 'Try another playlist' });
        break;
      case 101:
      case 150:
        actions.push({ label: 'Open playlist on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
        actions.push({ label: 'Open video on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
        break;
      default:
        actions.push({ label: 'Open playlist on YouTube', href: `https://www.youtube.com/playlist?list=${playlistId}`, external: true });
    }
    return actions;
  }

    return (
    <div tabIndex={0} onKeyDown={handleKeyDown} aria-label="Playlist player" >
      <div
        ref={containerRef}
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
      />

      <div className="mt-3 flex items-center gap-3" role="group" aria-label="player controls">
        <button
          aria-label="previous"
          className="rounded border px-2 py-1"
          onClick={() => {
            try {
              playerRef.current && playerRef.current.previousVideo && playerRef.current.previousVideo();
            } catch (e) {}
          }}
        >
          ◀
        </button>

        <button
          aria-label={isPlaying ? 'pause' : 'play'}
          className="rounded border px-3 py-1"
          onClick={() => {
            try {
              if (isPlaying) {
                playerRef.current && playerRef.current.pauseVideo && playerRef.current.pauseVideo();
              } else {
                playerRef.current && playerRef.current.playVideo && playerRef.current.playVideo();
              }
            } catch (e) {}
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          aria-label="next"
          className="rounded border px-2 py-1"
          onClick={() => {
            try {
              playerRef.current && playerRef.current.nextVideo && playerRef.current.nextVideo();
            } catch (e) {}
          }}
        >
          ▶
        </button>

        <div className="ml-4 text-sm text-zinc-600" aria-live="polite" role="status">
          {currentTitle ? <span className="font-medium">{currentTitle}</span> : <span>No title</span>}
          {typeof currentIndex === 'number' ? <span className="ml-2">(#{currentIndex + 1})</span> : null}
        </div>
      </div>
      {loading && <div className="mt-2 text-sm text-zinc-600">Loading player…</div>}

      {errorMessage && (
        <div role="alert" aria-live="assertive" className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
          <div className="font-medium">{errorMessage}</div>
          <div className="mt-2 flex gap-2">
            {mapYouTubeActions(null).map((a, i) => null)}
          </div>
          <div className="mt-2">
            {/* Render action suggestions based on the last error if available */}
            {/** The original YT error code may not be stored; attempt to parse code from message */}
            {(() => {
              // heuristically extract a numeric code from the message if present
              const codeMatch = String(errorMessage).match(/\((\d+)\)/);
              const code = codeMatch ? Number(codeMatch[1]) : null;
              const actions = mapYouTubeActions(code);
              return actions.map((act, idx) =>
                act.href ? (
                  <a key={idx} href={act.href} target={act.external ? '_blank' : undefined} rel={act.external ? 'noopener noreferrer' : undefined} className="inline-block rounded bg-white/10 px-3 py-1 text-sm text-blue-700 hover:underline">
                    {act.label}
                  </a>
                ) : (
                  <button key={idx} className="inline-block rounded bg-white/10 px-3 py-1 text-sm text-zinc-800">
                    {act.label}
                  </button>
                )
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
