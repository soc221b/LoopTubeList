import React, { useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  isYouTubeVideoUrl,
  getYouTubeVideoId,
} from "@/utils/isYouTubeVideoUrl";

type OEmbed = { title?: string; [k: string]: unknown };
const fetcher = (url: string): Promise<OEmbed> =>
  fetch(url).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error("not ok")),
  );

import { usePlaylist, usePlaylistDispatch } from "@/PlaylistContext";
import { computeNextReview } from "@/App";

export default function AddVideoForm() {
  const { list } = usePlaylist();
  const dispatch = usePlaylistDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const swrKey = pendingId ? `oembed:${pendingId}` : null;
  // useSWR to manage cache and dedupe; do not auto revalidate on mount so we trigger via mutate
  useSWR(
    swrKey,
    async (key) => {
      if (!key) return null;
      const vid = key.split(":")[1];
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + vid)}&format=json`;
      return fetcher(oembedUrl);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
      revalidateOnMount: false,
    },
  );

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const raw = url.trim();
    if (!raw) return;
    if (!isYouTubeVideoUrl(raw)) {
      setError("Only YouTube video URLs are supported.");
      return;
    }
    const youtubeId = getYouTubeVideoId(raw)!;
    const key = `oembed:${youtubeId}`;

    // if already exists in playlist, avoid fetching
    if (list.some((item) => item.youtubeId === youtubeId)) {
      setError("Video already in playlist.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setPendingId(youtubeId);
    try {
      let data: OEmbed | null = null;
      try {
        const res = await mutate(
          key,
          () => {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(raw)}&format=json`;
            return fetcher(oembedUrl);
          },
          { revalidate: true },
        );
        data = res ?? null;
      } catch {
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(raw)}&format=json`;
          const dd = await fetcher(oembedUrl);
          try {
            await mutate(key, dd, false);
          } catch {}
          data = dd;
        } catch {}
      }

      const title = data && data.title ? data.title : raw;
      setError(null);
      // dispatch add via context
      const v = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        youtubeId,
        title,
        url: raw,
        createdAt: Date.now(),
        reviewCount: 0,
        nextReview: computeNextReview(0),
      };
      try {
        dispatch({ type: "add", payload: v });
      } catch (err) {
        setError("Failed to add");
        inputRef.current?.focus();
        return;
      }
      // reset input and focus
      setUrl("");
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    } finally {
      setLoading(false);
      setPendingId(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Add video form"
      style={{ display: "flex", gap: 8, alignItems: "center" }}
    >
      <label htmlFor="url-input" style={{ position: "absolute", left: -9999 }}>
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
      {error && (
        <div role="alert" style={{ color: "crimson", marginTop: 8 }}>
          {error}
        </div>
      )}
      {loading && <div aria-hidden>Loading...</div>}
    </form>
  );
}
