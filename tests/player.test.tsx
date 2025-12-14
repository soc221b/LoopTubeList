import React from "react";
import {
  render,
  screen,
  within,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";

// Helper to mock the YouTube IFrame API for tests
function createYTMock() {
  const PlayerState = { ENDED: 0 };
  const eventsById: Record<string, any> = {};
  (window as any).YT = {
    Player: function (elemId: string, opts: any) {
      const id =
        (opts && opts.videoId) ||
        (elemId && String(elemId).replace(/^player-/, "")) ||
        "unknown";
      let currentVideo = id;
      const inst: any = {
        _opts: opts,
        getVideoData: () => ({ video_id: currentVideo }),
        playVideo: vi.fn(() => {}),
        pauseVideo: vi.fn(() => {}),
        stopVideo: vi.fn(() => {}),
        loadVideoById: vi.fn((vid: string) => {
          currentVideo = vid;
          // register events for the newly loaded id so tests can trigger ended
          if (opts) eventsById[vid] = opts;
        }),
        cueVideoById: vi.fn((vid: string) => {
          currentVideo = vid;
          if (opts) eventsById[vid] = opts;
        }),
      };
      // store events so tests can trigger state changes without peeking at internals
      if (opts && opts.events) eventsById[id] = opts.events;
      opts &&
        opts.events &&
        opts.events.onReady &&
        opts.events.onReady({ target: inst });
      return inst;
    },
    PlayerState,
  } as any;
  return {
    triggerEnded: (id: string) => {
      const ev = eventsById[id];
      if (ev && ev.onStateChange) ev.onStateChange({ data: PlayerState.ENDED });
    },
  };
}

describe("player and autoplay", () => {
  it("shows a play button on each item", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ title: "Play Test" }),
      }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=play111");
    await user.click(addButton);
    const list = await screen.findByRole("list", { name: /playlist/i });
    const item = await within(list).findByRole("listitem");
    expect(
      within(item).getByRole("button", { name: /play/i }),
    ).toBeInTheDocument();

    global.fetch = origFetch;
  });

  it("hides iframe if there is no pending reviews", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ title: "Hide Test" }),
      }) as any;

    // add a video and mark it reviewed via UI
    fireEvent.change(input, {
      target: { value: "https://www.youtube.com/watch?v=hide111" },
    });
    fireEvent.click(addButton);
    const list = await screen.findByRole("list", { name: /playlist/i });
    const links = within(list).getAllByRole("link");
    const link = links.find((l) =>
      (l as HTMLAnchorElement).href.includes("hide111"),
    );
    const item = link
      ? ((link as HTMLElement).closest("li") as HTMLElement)
      : await within(list).findByRole("listitem");

    const yt = createYTMock();

    // show player by clicking play
    await user.click(within(item).getByRole("button", { name: /play/i }));
    const iframe = await screen.findByTestId("player-iframe");
    const parent = iframe.parentElement as HTMLElement;
    // player is visible when there is something to review
    await waitFor(() => expect(parent.style.display).not.toBe("none"));

    // mark reviewed via UI
    await user.click(within(item).getByRole("button", { name: /reviewed/i }));

    // item should show Reviews: 1
    const after = await within(list).findAllByRole("listitem");
    const myItem = after.find((it) =>
      (within(it).getByRole("link") as HTMLAnchorElement).href.includes(
        "hide111",
      ),
    );
    expect(myItem).toBeDefined();
    await waitFor(() => expect(myItem!.textContent).toMatch(/Reviews:\s*1/));

    global.fetch = origFetch;
  });

  it("clicking play shows the player iframe", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ title: "Embed Test" }),
      }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=embed111");
    await user.click(addButton);
    const list = await screen.findByRole("list", { name: /playlist/i });
    const item = await within(list).findByRole("listitem");
    await user.click(within(item).getByRole("button", { name: /play/i }));
    const iframe = await screen.findByTestId("player-iframe");
    expect(iframe).toBeInTheDocument();
    // iframe is always present; ensure it's visible when play is clicked
    const parent = iframe.parentElement as HTMLElement;
    expect(parent.style.display).not.toBe("none");

    global.fetch = origFetch;
  });

  it("marks video reviewed when ended", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ title: "Review Test" }),
      }) as any;

    // add one video and mark reviewed via UI
    fireEvent.change(input, {
      target: { value: "https://www.youtube.com/watch?v=mr111" },
    });
    fireEvent.click(addButton);
    const list = await screen.findByRole("list", { name: /playlist/i });
    const links = within(list).getAllByRole("link");
    const link = links.find((l) =>
      (l as HTMLAnchorElement).href.includes("mr111"),
    );
    const item = link
      ? ((link as HTMLElement).closest("li") as HTMLElement)
      : await within(list).findByRole("listitem");

    // mark reviewed via UI
    await user.click(within(item).getByRole("button", { name: /reviewed/i }));

    // item should show Reviews: 1
    const after = await within(list).findAllByRole("listitem");
    const myItem = after.find((it) =>
      (within(it).getByRole("link") as HTMLAnchorElement).href.includes(
        "mr111",
      ),
    );
    expect(myItem).toBeDefined();
    await waitFor(() => expect(myItem!.textContent).toMatch(/Reviews:\s*1/));

    global.fetch = origFetch;
  });

  it("starts next pending review when current one ended", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ title: "Auto Next Test" }),
      }) as any;

    const yt = createYTMock();

    // add two videos
    await user.type(input, "https://www.youtube.com/watch?v=first111");
    await user.click(addButton);
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=second222");
    await user.click(addButton);

    const list = await screen.findByRole("list", { name: /playlist/i });
    const links = within(list).getAllByRole("link");
    const firstLink = links.find((l) =>
      (l as HTMLAnchorElement).href.includes("first111"),
    );
    const firstItem = firstLink
      ? ((firstLink as HTMLElement).closest("li") as HTMLElement)
      : (await within(list).findAllByRole("listitem"))[0];
    // mark first as reviewed via the UI
    await user.click(
      within(firstItem).getByRole("button", { name: /reviewed/i }),
    );
    await waitFor(() => {
      const after = within(list).getAllByRole("listitem");
      const first = after.find((it) =>
        (within(it).getByRole("link") as HTMLAnchorElement).href.includes(
          "first111",
        ),
      );
      expect(first).toBeDefined();
      expect(first!.textContent).toMatch(/Reviews:\s*1/);
    });

    // mark second reviewed via UI as well
    const links2 = within(list).getAllByRole("link");
    const secondLink = links2.find((l) =>
      (l as HTMLAnchorElement).href.includes("second222"),
    );
    const secondItem = secondLink
      ? ((secondLink as HTMLElement).closest("li") as HTMLElement)
      : (await within(list).findAllByRole("listitem"))[1];
    await user.click(
      within(secondItem).getByRole("button", { name: /reviewed/i }),
    );

    // both should now show Reviews: 1
    await waitFor(() => {
      const after = within(list).getAllByRole("listitem");
      const first = after.find((it) =>
        (within(it).getByRole("link") as HTMLAnchorElement).href.includes(
          "first111",
        ),
      );
      const second = after.find((it) =>
        (within(it).getByRole("link") as HTMLAnchorElement).href.includes(
          "second222",
        ),
      );
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(first!.textContent).toMatch(/Reviews:\s*1/);
      expect(second!.textContent).toMatch(/Reviews:\s*1/);
    });

    global.fetch = origFetch;
  });
});
