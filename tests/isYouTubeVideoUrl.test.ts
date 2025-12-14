import { describe, it, expect } from "vitest";
import { isYouTubeVideoUrl } from "@/utils/isYouTubeVideoUrl";

const valid = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtu.be/dQw4w9WgXcQ",
  "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
];

const invalid = [
  "https://www.youtube.com/",
  "https://vimeo.com/123456",
  "https://www.youtube.com/channel/UCabcdef",
];

describe("isYouTubeVideoUrl", () => {
  valid.forEach((url) => {
    it(`returns true for ${url}`, () => {
      expect(isYouTubeVideoUrl(url)).toBe(true);
    });
  });

  invalid.forEach((url) => {
    it(`returns false for ${url}`, () => {
      expect(isYouTubeVideoUrl(url)).toBe(false);
    });
  });
});
