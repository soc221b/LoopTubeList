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
      const active = (typeof document !== "undefined" &&
        document.activeElement) as Element | null;
      if (active) {
        const tag = active.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          (active as HTMLElement).isContentEditable
        )
          return;
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

  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 1000 }}>
      <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 style={{ margin: 0 }}>Loop Tube List</h1>
          <div style={{ marginLeft: 12 }}>
            <button
              onClick={undo}
              disabled={past.length === 0}
              aria-label="Undo"
              style={{ marginRight: 8 }}
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              aria-label="Redo"
            >
              Redo
            </button>
          </div>
        </div>

        <VideoPlayer playingId={playingId} setPlayingId={setPlayingId} />

        <Playlist setPlayingId={setPlayingId} />
      </main>
    </SWRConfig>
  );
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.videos)) {
        return { list: parsed.videos, past: [], future: [] };
      }
    }
  } catch {}
  return undefined;
}

export default function App(): ReactElement {
  return (
    <PlaylistProvider initial={loadInitial()}>
      <AppInner />
    </PlaylistProvider>
  );
}
