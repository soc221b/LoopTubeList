import React, { useEffect, useState, type ReactElement } from "react";
import { SWRConfig } from "swr";

import Playlist from "@/components/Playlist";
import VideoPlayer from "@/components/Video";
import {
  PlaylistProvider,
  usePlaylist,
  usePlaylistDispatch,
  type Video as PVideo,
} from "@/PlaylistContext";

const STORAGE_KEY = "watchlist_v1";
const INTERVAL_DAYS = [1, 3, 7, 14, 30];

function daysFromNow(days: number) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

export function computeNextReview(reviewCount: number) {
  const idx = Math.min(reviewCount, INTERVAL_DAYS.length - 1);
  return daysFromNow(INTERVAL_DAYS[idx]);
}

function save(list: PVideo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function AppInner(): ReactElement {
  const { list, past, future } = usePlaylist();
  const dispatch = usePlaylistDispatch();
  const [playingId, setPlayingId] = useState<string | null>(null);

  function applyNewList(newList: PVideo[]) {
    dispatch({ type: "set", payload: newList });
  }

  function undo() {
    dispatch({ type: "undo" });
  }

  function redo() {
    dispatch({ type: "redo" });
  }

  useEffect(() => {
    save(list);
  }, [list]);

  const sorted = [...list].sort((a, b) => a.nextReview - b.nextReview);

  // keyboard shortcuts for undo/redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = (typeof document !== "undefined" && document.activeElement) as Element | null;
      if (active) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (active as HTMLElement).isContentEditable) return;
      }
      const key = (e.key || "").toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (!e.shiftKey && key === "z") {
        e.preventDefault();
        dispatch({ type: "undo" });
        return;
      }
      if ((e.shiftKey && key === "z") || key === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, past.length, future.length]);

  function remove(id: string) {
    dispatch({ type: "remove", payload: { id } });
  }

  function markReviewed(id: string) {
    const nextReview = computeNextReview(list.find((v) => v.id === id)?.reviewCount! + 1);
    dispatch({ type: "reviewed", payload: { id, nextReview } });
  }

  function resetSchedule(id: string) {
    const nextReview = computeNextReview(0);
    dispatch({ type: "reset", payload: { id, nextReview } });
  }

  const playersRef = React.useRef<Record<string, any>>({});

  function tryCreatePlayer(youtubeId: string) {
    try {
      if (typeof window !== "undefined" && !(window as any).YT) {
        const existing = document.getElementById("youtube-iframe-api");
        if (!existing) {
          const s = document.createElement("script");
          s.src = "https://www.youtube.com/iframe_api";
          s.id = "youtube-iframe-api";
          document.body.appendChild(s);
        }
      }
      const YT = (window as any).YT;
      const elemId = `player-iframe`;
      if (YT && YT.Player) {
        if (!playersRef.current.main) {
          const player = new YT.Player(elemId, {
            videoId: youtubeId,
            events: {
              onReady: () => {},
              onStateChange: (e: any) => {
                const stateEnded = YT.PlayerState && e && e.data === YT.PlayerState.ENDED;
                if (stateEnded) {
                  let currentId = youtubeId;
                  try {
                    if (playersRef.current.main && typeof playersRef.current.main.getVideoData === "function") {
                      const info = playersRef.current.main.getVideoData();
                      if (info && info.video_id) currentId = info.video_id;
                    }
                  } catch {}
                  handleVideoEndedByYoutubeId(currentId);
                }
              },
            },
          });
          (window as any).__ytPlayers = (window as any).__ytPlayers || {};
          (window as any).__ytPlayers[youtubeId] = player;
          playersRef.current.main = player;
        } else {
          try {
            playersRef.current.main.loadVideoById && playersRef.current.main.loadVideoById(youtubeId);
            (window as any).__ytPlayers = (window as any).__ytPlayers || {};
            (window as any).__ytPlayers[youtubeId] = playersRef.current.main;
          } catch {}
        }
      }
    } catch {}
  }

  function handleVideoEndedByYoutubeId(youtubeId: string) {
    const found = list.find((v) => v.youtubeId === youtubeId);
    if (!found) return;
    const now = Date.now();
    const next = [...list].sort((a, b) => a.nextReview - b.nextReview).find((v) => v.youtubeId !== youtubeId && (v.reviewCount === 0 || v.nextReview <= now));
    markReviewed(found.id);
    if (next) {
      setPlayingId(next.id);
      if (next.youtubeId) {
        tryCreatePlayer(next.youtubeId);
        try {
          (window as any).__ytPlayers = (window as any).__ytPlayers || {};
          if (playersRef.current.main) (window as any).__ytPlayers[next.youtubeId] = playersRef.current.main;
          else (window as any).__ytPlayers[next.youtubeId] = (window as any).__ytPlayers[next.youtubeId] || {};
        } catch {}
      }
      try {
        (window as any).__ytPlayers = (window as any).__ytPlayers || {};
        list.forEach((itm) => {
          if (itm.youtubeId) (window as any).__ytPlayers[itm.youtubeId] = (window as any).__ytPlayers[itm.youtubeId] || {};
        });
      } catch {}
      try {
        playersRef.current.main && playersRef.current.main.playVideo && playersRef.current.main.playVideo();
      } catch {}
    } else setPlayingId(null);
  }

  function anyNeedsReview(): boolean {
    const now = Date.now();
    return list.some((v) => v.reviewCount === 0 || v.nextReview <= now);
  }

  useEffect(() => {
    if (playingId) {
      const v = list.find((x) => x.id === playingId);
      if (v && v.youtubeId) tryCreatePlayer(v.youtubeId);
    }
  }, [playingId, list]);

  useEffect(() => {
    if (list.length === 0) return;
    if (!anyNeedsReview()) {
      return;
    }
    const first = sorted[0];
    if (first && first.youtubeId) {
      tryCreatePlayer(first.youtubeId);
    }
  }, [list]);

  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 1000 }}>
      <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 style={{ margin: 0 }}>Loop Tube List</h1>
          <div style={{ marginLeft: 12 }}>
            <button onClick={undo} disabled={past.length === 0} aria-label="Undo" style={{ marginRight: 8 }}>
              Undo
            </button>
            <button onClick={redo} disabled={future.length === 0} aria-label="Redo">
              Redo
            </button>
          </div>
        </div>

        <VideoPlayer playingId={playingId} />

        <Playlist
          list={list}
          sorted={sorted}
          playingId={playingId}
          playersRef={playersRef}
          setPlayingId={setPlayingId}
          tryCreatePlayer={tryCreatePlayer}
          markReviewed={markReviewed}
          resetSchedule={resetSchedule}
          remove={remove}
          applyNewList={applyNewList}
          computeNextReview={computeNextReview}
          anyNeedsReview={anyNeedsReview}
        />
      </main>
    </SWRConfig>
  );
}

export default function App(): ReactElement {
  return (
    <PlaylistProvider>
      <AppInner />
    </PlaylistProvider>
  );
}
