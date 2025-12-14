import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";
import {
  expectPlaylistItemToHaveReviews,
  playPlaylistItem,
  reviewPlaylistItem,
} from "./helpers";

// Helper to mock the YouTube IFrame API for tests
function setupYTMock() {
  let currentVideoId: string;
  let hasInvokedSimulatingReady = false;
  let ready: () => void = () => {};
  const simulateReady = vi.fn().mockImplementation(() => {
    hasInvokedSimulatingReady = true;
    ready();
  });
  let hasInvokedSimulatingEnd = false;
  let end: () => void = () => {};
  const simulateEnd = vi.fn().mockImplementation(() => {
    hasInvokedSimulatingEnd = true;
    end();
  });
  const playVideo = vi.fn();
  const pauseVideo = vi.fn();
  const stopVideo = vi.fn();
  const loadVideoById = vi.fn((id: string) => {
    currentVideoId = id;
  });
  const PlayerState = { ENDED: 0 };
  (window as any).YT = {
    Player: function (elemId: string, opts: any) {
      const id =
        (opts && opts.videoId) ||
        (elemId && String(elemId).replace(/^player-/, "")) ||
        "unknown";
      currentVideoId = id;
      const inst: any = {
        _opts: opts,
        getVideoData: () => ({ video_id: currentVideoId }),
        playVideo,
        pauseVideo,
        stopVideo,
        loadVideoById,
      };
      ready = () => {
        act(() => {
          opts &&
            opts.events &&
            opts.events.onReady &&
            opts.events.onReady({ target: inst });
        });
      };
      if (hasInvokedSimulatingReady) ready();
      end = () => {
        act(() => {
          opts &&
            opts.events &&
            opts.events.onStateChange &&
            opts.events.onStateChange({
              data: PlayerState.ENDED,
              target: inst,
            });
        });
      };
      if (hasInvokedSimulatingEnd) end();
      return inst;
    },
    PlayerState,
  } as any;

  return {
    playVideo,
    pauseVideo,
    stopVideo,
    loadVideoById,
    simulateReady,
    simulateEnd,
  };
}

describe("player and autoplay", () => {
  let ytMock: ReturnType<typeof setupYTMock>;

  beforeEach(() => {
    ytMock = setupYTMock();
  });

  afterEach(() => {
    expect(ytMock.playVideo).not.toHaveBeenCalled();
    expect(ytMock.pauseVideo).not.toHaveBeenCalled();
    expect(ytMock.stopVideo).not.toHaveBeenCalled();
    expect(ytMock.loadVideoById).not.toHaveBeenCalled();
    ytMock = undefined as any;
  });

  it("should not load video if player is not ready yet", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Not Ready Test" }),
    }) as any;
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=notready111");
    await user.click(addButton);

    await playPlaylistItem(user, 0);

    expect(ytMock.loadVideoById).not.toHaveBeenCalled();
    expect(ytMock.playVideo).not.toHaveBeenCalled();

    global.fetch = origFetch;
  });

  it("should load video when player becomes ready", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Not Ready Test" }),
    }) as any;
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=waitready111");
    await user.click(addButton);

    await playPlaylistItem(user, 0);
    await ytMock.simulateReady();

    expect(ytMock.loadVideoById).toHaveBeenCalledOnce();
    expect(ytMock.loadVideoById).toHaveBeenCalledWith("waitready111");
    expect(ytMock.playVideo).toHaveBeenCalledOnce();

    ytMock.loadVideoById.mockClear();
    ytMock.playVideo.mockClear();
    global.fetch = origFetch;
  });

  it("should load video when there is a pending review on initial load", async () => {
    localStorage.setItem(
      "loopTubeList",
      JSON.stringify({
        videos: [
          {
            id: "persist111",
            youtubeId: "persist111",
            title: "Persistent Video",
            url: "https://www.youtube.com/watch?v=persist111",
            createdAt: Date.now(),
            reviewCount: 0,
            nextReview: Date.now() - 1000, // due for review
          },
        ],
      }),
    );
    render(<App />);
    await ytMock.simulateReady();

    expect(ytMock.loadVideoById).toHaveBeenCalledOnce();
    expect(ytMock.loadVideoById).toHaveBeenCalledWith("persist111");

    ytMock.loadVideoById.mockClear();
  });

  it("plays the video when clicking play after player is ready", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Embed Test" }),
    }) as any;
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=embed111");
    await user.click(addButton);

    await ytMock.simulateReady();
    expect(ytMock.loadVideoById).toHaveBeenCalledOnce();
    expect(ytMock.loadVideoById).toHaveBeenCalledWith("embed111");
    await playPlaylistItem(user, 0);
    expect(ytMock.playVideo).toHaveBeenCalledOnce();

    ytMock.loadVideoById.mockClear();
    ytMock.playVideo.mockClear();
    global.fetch = origFetch;
  });

  it("stops the player when marking reviewed", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Hide Test" }),
    }) as any;
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=abc");
    await user.click(addButton);
    await ytMock.simulateReady();
    expect(ytMock.loadVideoById).toHaveBeenCalledOnce();
    expect(ytMock.loadVideoById).toHaveBeenCalledWith("abc");

    await reviewPlaylistItem(user, 0);
    expect(ytMock.stopVideo).toHaveBeenCalledOnce();

    ytMock.loadVideoById.mockClear();
    ytMock.stopVideo.mockClear();
    global.fetch = origFetch;
  });

  it("marks video reviewed when ended", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Review Test" }),
    }) as any;
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=mr111");
    await user.click(addButton);
    await expectPlaylistItemToHaveReviews(0, 0);
    await ytMock.simulateReady();
    expect(ytMock.loadVideoById).toHaveBeenCalledOnce();
    expect(ytMock.loadVideoById).toHaveBeenCalledWith("mr111");

    await playPlaylistItem(user, 0);
    expect(ytMock.playVideo).toHaveBeenCalledOnce();
    await ytMock.simulateEnd();
    await expectPlaylistItemToHaveReviews(0, 1);

    ytMock.loadVideoById.mockClear();
    ytMock.playVideo.mockClear();
    global.fetch = origFetch;
  });

  it("starts next pending review when current one ended", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Auto Next Test" }),
    }) as any;
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=first111");
    await user.click(addButton);
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=second222");
    await user.click(addButton);
    await ytMock.simulateReady();
    expect(ytMock.loadVideoById).toHaveBeenCalledTimes(1);
    expect(ytMock.loadVideoById).toHaveBeenNthCalledWith(1, "first111");

    await playPlaylistItem(user, 0);
    expect(ytMock.playVideo).toHaveBeenCalledOnce();
    await ytMock.simulateEnd();

    expect(ytMock.loadVideoById).toHaveBeenCalledTimes(2);
    expect(ytMock.loadVideoById).toHaveBeenNthCalledWith(2, "second222");
    expect(ytMock.playVideo).toHaveBeenCalledTimes(2);

    ytMock.loadVideoById.mockClear();
    ytMock.playVideo.mockClear();
    global.fetch = origFetch;
  });
});
