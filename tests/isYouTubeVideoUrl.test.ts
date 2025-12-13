import { describe, it, expect } from "vitest";
import { isYouTubeVideoUrl } from "@/utils/isYouTubeVideoUrl";

describe("isYouTubeVideoUrl", () => {
  it("returns true for a valid watch URL", () => {
    expect(isYouTubeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("returns false for youtube homepage", () => {
    expect(isYouTubeVideoUrl("https://www.youtube.com/")).toBe(false);
  });

  it("returns false for non-youtube url", () => {
    expect(isYouTubeVideoUrl("https://vimeo.com/123456")).toBe(false);
  });

  it("returns true for youtu.be short URL", () => {
    expect(isYouTubeVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("returns false for youtube channel page", () => {
    expect(isYouTubeVideoUrl("https://www.youtube.com/channel/UCabcdef")).toBe(false);
  });

  it("returns true for shorts and embed urls", () => {
    expect(isYouTubeVideoUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });
});
