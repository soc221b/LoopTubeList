import { useEffect, useMemo, useState, type ReactElement, type FormEvent } from "react";
import { isYouTubeVideoUrl } from "@/utils/isYouTubeVideoUrl";

type Video = {
  id: string;
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

  const sorted = useMemo(
    () => [...list].sort((a, b) => a.nextReview - b.nextReview),
    [list],
  );

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;
    const rawUrl = url.trim();
    // Validate using shared utility (may verify via oEmbed / YouTube Data API)
    const ok = await isYouTubeVideoUrl(rawUrl);
    if (!ok) { setError('Only YouTube video URLs are supported.'); return; }
    let fetchedTitle = rawUrl;
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) fetchedTitle = data.title;
      }
    } catch {}
    setError(null);
    const v: Video = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: fetchedTitle,
      url: rawUrl,
      createdAt: Date.now(),
      reviewCount: 0,
      nextReview: computeNextReview(0),
    };
    setList((s) => [v, ...s]);
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
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Loop Tube List</h1>
      <section style={{ marginBottom: 20 }}>
        <h2>Add video</h2>
        <form onSubmit={handleSubmit} aria-label="Add video form" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label htmlFor="url-input" style={{ position: "absolute", left: -9999 }}>YouTube URL</label>
          <input
            id="url-input"
            type="url"
            placeholder="YouTube URL"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            style={{ flex: 1, padding: "8px" }}
            required
            aria-required="true"
            autoFocus
          />
          <button type="submit" style={{ padding: "8px 12px" }} aria-label="Add video">Add</button>
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
        <ul role="list" aria-label="Playlist" style={{ listStyle: "none", padding: 0 }}>
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
  );
}
