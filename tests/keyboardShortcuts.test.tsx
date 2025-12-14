import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { expectPlaylistToHaveLength } from "./helpers";

describe("keyboard shortcuts", () => {
  it("undoes adding via Ctrl+Z (Windows)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "KB Undo Win" }),
    }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=uwin111");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);
    input.blur();

    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    await expectPlaylistToHaveLength(0);

    global.fetch = origFetch;
  });

  it("undoes adding via Meta+Z (Mac)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "KB Undo Mac" }),
    }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=umac111");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);
    input.blur();

    fireEvent.keyDown(window, { key: "z", metaKey: true });
    await expectPlaylistToHaveLength(0);

    global.fetch = origFetch;
  });

  it("redoes via Ctrl+Y (Windows)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "KB Redo Win" }),
    }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=rwin111");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);
    input.blur();
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    await expectPlaylistToHaveLength(0);

    fireEvent.keyDown(window, { key: "y", ctrlKey: true });
    await expectPlaylistToHaveLength(1);

    global.fetch = origFetch;
  });

  it("redoes via Ctrl+Shift+Z (Windows)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "KB Redo Win" }),
    }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=rwin111");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);
    input.blur();
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    await expectPlaylistToHaveLength(0);

    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    await expectPlaylistToHaveLength(1);

    global.fetch = origFetch;
  });

  it("redoes via Meta+Shift+Z (Mac)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "KB Redo Mac" }),
    }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=rmac111");
    await user.click(addButton);
    await expectPlaylistToHaveLength(1);
    input.blur();
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    await expectPlaylistToHaveLength(0);

    fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });
    await expectPlaylistToHaveLength(1);

    global.fetch = origFetch;
  });
});
