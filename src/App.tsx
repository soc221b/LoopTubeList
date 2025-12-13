import React, { useEffect, useMemo, useState, type ReactElement } from "react";
import { SWRConfig } from "swr";

import AddVideoForm from "@/components/AddVideoForm";

type Video = {
  id: string;
  youtubeId?: string;
  title: string;
  url: string;
  createdAt: number;
  reviewCount: number;
  nextReview: number;
};

const STORAGE_KEY = "watchlist_v1";
const INTERVAL_DAYS = [1, 3, 7, 14, 30];

function daysFromNow(days: number) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function computeNextReview(reviewCount: number) {
  const idx = Math.min(reviewCount, INTERVAL_DAYS.length - 1);
  return daysFromNow(INTERVAL_DAYS[idx]);
}

function save(list: Video[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function App(): ReactElement {
  const [list, setList] = useState<Video[]>(() => {
    try {
      // in test environment, avoid persisting between test runs
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "test"
      )
        return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Video[]) : [];
    } catch {
      return [];
    }
  });

  // history stacks for undo/redo
  const [past, setPast] = useState<Video[][]>([]);
  const [future, setFuture] = useState<Video[][]>([]);

  function applyNewList(newList: Video[]) {
    setPast((p) => [...p, list]);
    setFuture([]);
    setList(newList);
  }

  function undo() {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, p.length - 1));
    setFuture((f) => [list, ...f]);
    setList(previous);
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, list]);
    setList(next);
  }

  useEffect(() => {
    save(list);
  }, [list]);

  const sorted = useMemo(
    () => [...list].sort((a, b) => a.nextReview - b.nextReview),
    [list],
  );

  // keyboard shortcuts for undo/redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = (e.key || "").toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      // Ctrl/Cmd+Z => undo (without shift)
      if (!e.shiftKey && key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      // Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y => redo
      if ((e.shiftKey && key === "z") || key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, past.length, future.length]);

  function remove(id: string) {
    const newList = list.filter((v) => v.id !== id);
    applyNewList(newList);
  }

  function markReviewed(id: string) {
    const newList = list.map((v) => {
      if (v.id !== id) return v;
      const nextCount = v.reviewCount + 1;
      return {
        ...v,
        reviewCount: nextCount,
        nextReview: computeNextReview(nextCount),
      };
    });
    applyNewList(newList);
  }

  function resetSchedule(id: string) {
    const newList = list.map((v) =>
      v.id !== id ? v : { ...v, reviewCount: 0, nextReview: computeNextReview(0) },
    );
    applyNewList(newList);
  }

  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 1000 }}>
      <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ margin: 0 }}>Loop Tube List</h1>
          <div style={{ marginLeft: 12 }}>
            <button onClick={undo} disabled={past.length === 0} aria-label="Undo" style={{ marginRight: 8 }}>Undo</button>
            <button onClick={redo} disabled={future.length === 0} aria-label="Redo">Redo</button>
          </div>
        </div>
        <section style={{ marginBottom: 20 }}>
          <h2>Add video</h2>
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
              const v: Video = {
                id:
                  Date.now().toString(36) +
                  Math.random().toString(36).slice(2, 8),
                youtubeId,
                title,
                url: rawUrl,
                createdAt: Date.now(),
                reviewCount: 0,
                nextReview: computeNextReview(0),
              };
              applyNewList([v, ...list]);
              return { success: true };
            }}
          />
        </section>

        <section>
          <h2>Playlist ({list.length})</h2>
          {sorted.length === 0 && <p>No videos yet. Add one above.</p>}
          <ul
            role="list"
            aria-label="Playlist"
            style={{ listStyle: "none", padding: 0 }}
          >
            {sorted.map((v) => (
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
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
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <button
                      onClick={() => markReviewed(v.id)}
                      title="Mark reviewed"
                    >
                      Reviewed
                    </button>
                    <button
                      onClick={() => resetSchedule(v.id)}
                      title="Reset schedule"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => remove(v.id)}
                      style={{ color: "crimson" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SWRConfig>
  );
}
