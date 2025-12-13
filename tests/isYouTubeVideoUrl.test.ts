import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isYouTubeVideoUrl } from "@/utils/isYouTubeVideoUrl";

function mockFetchOnce(ok: boolean, body?: any) {
  return Promise.resolve({ ok, json: async () => body });
}

describe("isYouTubeVideoUrl", () => {
  let origFetch: any;
  beforeEach(() => {
    origFetch = global.fetch;
  });
  afterEach(async () => {
    global.fetch = origFetch;
    vi.resetAllMocks();
    const cacheMod = await import('@/utils/clearDedupeCache');
    if (cacheMod && cacheMod.clearDedupeCache) cacheMod.clearDedupeCache();
    const resMod = await import('@/utils/clearDedupeResults');
    if (resMod && resMod.clearDedupeResults) resMod.clearDedupeResults();
  });

  it("returns true for a valid watch URL when oEmbed succeeds", async () => {
    global.fetch = vi
      .fn()
      .mockImplementation(() => mockFetchOnce(true, { title: "Video" }));
    const res = await isYouTubeVideoUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(res).toBe(true);
  });

  it("returns false for youtube homepage", async () => {
    const res = await isYouTubeVideoUrl("https://www.youtube.com/");
    expect(res).toBe(false);
  });

  it("returns false for non-youtube url", async () => {
    const res = await isYouTubeVideoUrl("https://vimeo.com/123456");
    expect(res).toBe(false);
  });

  it("returns true for youtu.be short URL when oEmbed succeeds", async () => {
    global.fetch = vi
      .fn()
      .mockImplementation(() => mockFetchOnce(true, { title: "Short" }));
    const res = await isYouTubeVideoUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(res).toBe(true);
  });

  it("falls back to YouTube Data API when oEmbed fails and useApi is true", async () => {
    // first oEmbed fails
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({ ok: false });
    // then API returns items
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [{ id: "dQw4w9WgXcQ" }] }),
    });
    global.fetch = fetchMock as any;

    const res = await isYouTubeVideoUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      { useApi: true, apiKey: "FAKE" },
    );
    expect(res).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns false for youtube channel page", async () => {
    const res = await isYouTubeVideoUrl(
      "https://www.youtube.com/channel/UCabcdef",
    );
    expect(res).toBe(false);
  });

  it("returns true for shorts and embed urls when oEmbed succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => mockFetchOnce(true, { title: "Short" }));
    global.fetch = fetchMock as any;
    const res1 = await isYouTubeVideoUrl(
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    );
    const res2 = await isYouTubeVideoUrl(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
    expect(res1).toBe(true);
    expect(res2).toBe(true);
  });

  it("does not call oEmbed twice within 1s for same url", async () => {
    const fetchMock = vi.fn().mockImplementation(() => mockFetchOnce(true, { title: "Video" }));
    global.fetch = fetchMock as any;
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const p1 = isYouTubeVideoUrl(url);
    const p2 = isYouTubeVideoUrl(url);
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(true);
    expect(r2).toBe(true);
    // fetch should have been called only once due to dedupeFetcher
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches successful oEmbed response for app lifecycle", async () => {
    const fetchMock = vi.fn().mockImplementation(() => mockFetchOnce(true, { title: "Video" }));
    global.fetch = fetchMock as any;
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const r1 = await isYouTubeVideoUrl(url);
    expect(r1).toBe(true);
    // clear in-flight promises but keep results
    const mod = await import('@/utils/dedupeFetcher');
    mod.clearDedupeCache();
    // call again — should not invoke fetch because result cached for lifecycle
    const r2 = await isYouTubeVideoUrl(url);
    expect(r2).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares cached response for different urls with same youtube id", async () => {
    const fetchMock = vi.fn().mockImplementation(() => mockFetchOnce(true, { title: "Video" }));
    global.fetch = fetchMock as any;
    const url1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const url2 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley';
    const p1 = isYouTubeVideoUrl(url1);
    const p2 = isYouTubeVideoUrl(url2);
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(true);
    expect(r2).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
