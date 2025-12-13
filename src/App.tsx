import React, { useEffect, useMemo, useState, useRef, type ReactElement, type FormEvent } from "react";
import { SWRConfig } from 'swr';
import { isYouTubeVideoUrl, getYouTubeVideoId, clearOembedCache } from "@/utils/isYouTubeVideoUrl";


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
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [list, setList] = useState<Video[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Video[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    save(list);
  }, [list]);

  // Clear any module-level oEmbed cache when App mounts to avoid cross-test pollution
  useEffect(() => {
    try { clearOembedCache(); } catch {}
  }, []);

  const sorted = useMemo(
    () => [...list].sort((a, b) => a.nextReview - b.nextReview),
    [list],
  );

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;
    const rawUrl = url.trim();
    // Validate format quickly without remote checks to avoid duplicate network calls
    const ok = await isYouTubeVideoUrl(rawUrl, { checkRemote: false });
    if (!ok) {
      setError("Only YouTube video URLs are supported.");
      return;
    }
    let fetchedTitle = rawUrl;
    setError(null);
    const youtubeId = getYouTubeVideoId(rawUrl);
    if (youtubeId) {
      try {
        const mod = await import('@/utils/isYouTubeVideoUrl');
        const data = await mod.fetchOembedForVideo(youtubeId, rawUrl);
        if (data && data.title) fetchedTitle = data.title;
      } catch {
        // fallback: try direct fetch
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`;
        try {
          const res = await fetch(oembedUrl);
          if (res.ok) {
            const data = await res.json();
            if (data && data.title) fetchedTitle = data.title;
          }
        } catch {}
      }
    }
    if (!youtubeId) { setError('Only YouTube video URLs are supported.'); return; }
    // prevent duplicates by youtube id
    if (list.some((item) => item.youtubeId === youtubeId)) {
      setError('Video already in playlist.');
      inputRef.current?.focus();
      return;
    }
    const v: Video = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      youtubeId,
      title: fetchedTitle,
      url: rawUrl,
      createdAt: Date.now(),
      reviewCount: 0,
      nextReview: computeNextReview(0),
    };
    setList((s) => [v, ...s]);
    setUrl("");
    if (inputRef.current) {
      inputRef.current.value = ""; // ensure DOM input cleared immediately
      inputRef.current.focus();
    }
  }

  function remove(id: string) {
    setList((s) => s.filter((v) => v.id !== id));
  }

  function markReviewed(id: string) {
    setList((s) =>
      s.map((v) => {
        if (v.id !== id) return v;
        const nextCount = v.reviewCount + 1;
        return {
          ...v,
          reviewCount: nextCount,
          nextReview: computeNextReview(nextCount),
        };
      }),
    );
  }

  function resetSchedule(id: string) {
    setList((s) =>
      s.map((v) =>
        v.id !== id
          ? v
          : { ...v, reviewCount: 0, nextReview: computeNextReview(0) },
      ),
    );
  }

  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <h1>Loop Tube List</h1>
      <section style={{ marginBottom: 20 }}>
        <h2>Add video</h2>
        <form
          onSubmit={handleSubmit}
          aria-label="Add video form"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <label
            htmlFor="url-input"
            style={{ position: "absolute", left: -9999 }}
          >
            YouTube URL
          </label>
          <input
            ref={inputRef}
            id="url-input"
            type="url"
            placeholder="YouTube URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            style={{ flex: 1, padding: "8px" }}
            required
            aria-required="true"
            autoFocus
          />
          <button
            type="submit"
            style={{ padding: "8px 12px" }}
            aria-label="Add video"
          >
            Add
          </button>
        </form>
        {error && (
          <div role="alert" style={{ color: "crimson", marginTop: 8 }}>
            {error}
          </div>
        )}
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
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
