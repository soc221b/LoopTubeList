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
  afterEach(() => {
    global.fetch = origFetch;
    vi.resetAllMocks();
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
});
