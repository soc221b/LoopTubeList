import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";
import {
  expectPlaylistItemToHaveReviews,
  expectPlaylistToHaveLength,
  getPlaylistItem,
  resetPlaylistItem,
  reviewPlaylistItem,
  removePlaylistItem,
} from "./helpers";

async function undo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /undo/i }));
}

async function redo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /redo/i }));
}

describe("undo/redo", () => {
  it("undoes and redoes adding", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Undo Test" }),
    }) as any;
    await user.type(input, "https://www.youtube.com/watch?v=aaa111");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);

    await undo(user);
    await expectPlaylistToHaveLength(0);
    await redo(user);
    await expectPlaylistToHaveLength(1);

    global.fetch = origFetch;
  });

  it("undoes and redoes reviewing", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Review Test" }),
    }) as any;
    await user.type(input, "https://www.youtube.com/watch?v=bbb222");
    await user.click(addButton);
    await reviewPlaylistItem(user, 0);

    await undo(user);
    await expectPlaylistItemToHaveReviews(0, 0);
    await redo(user);
    await expectPlaylistItemToHaveReviews(0, 1);

    global.fetch = origFetch;
  });

  it("disables reset when reviews is 0", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "NoReset Test" }),
    }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=noreset1");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);

    const item = await getPlaylistItem(0);
    const resetBtn = within(item).getByRole("button", { name: /reset/i });
    expect(resetBtn).toBeDisabled();

    global.fetch = origFetch;
  });

  it("undoes and redoes reset", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Reset Test" }),
    }) as any;
    await user.type(input, "https://www.youtube.com/watch?v=ccc333");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);

    await reviewPlaylistItem(user, 0);
    await reviewPlaylistItem(user, 0);
    await resetPlaylistItem(user, 0);

    await undo(user);
    await expectPlaylistItemToHaveReviews(0, 2);
    await redo(user);
    await expectPlaylistItemToHaveReviews(0, 0);

    global.fetch = origFetch;
  });

  it("undoes and redoes remove", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Remove Test" }),
    }) as any;
    await user.type(input, "https://www.youtube.com/watch?v=ddd444");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);
    await removePlaylistItem(user, 0);

    await undo(user);
    await expectPlaylistToHaveLength(1);
    await redo(user);
    await expectPlaylistToHaveLength(0);

    global.fetch = origFetch;
  });
});
