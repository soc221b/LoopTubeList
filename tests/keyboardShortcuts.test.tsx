import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";

describe("keyboard shortcuts", () => {
  it("undoes adding via Ctrl+Z (Windows/Linux)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });

    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "KB Undo Win" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=uwin111");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    await within(list).findByRole("listitem");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // ensure input is not focused so app-level undo applies
    input.blur();

    // Ctrl+Z
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    global.fetch = origFetch;
  });

  it("undoes adding via Meta+Z (Mac)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });

    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "KB Undo Mac" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=umac111");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    await within(list).findByRole("listitem");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // ensure input is not focused so app-level undo applies
    input.blur();

    // Meta+Z
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    global.fetch = origFetch;
  });

  it("redoes via Ctrl+Y and Ctrl+Shift+Z (Windows/Linux)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });

    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "KB Redo Win" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=rwin111");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    await within(list).findByRole("listitem");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // undo
    input.blur();
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo via Ctrl+Y
    fireEvent.keyDown(window, { key: "y", ctrlKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // undo again
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo via Ctrl+Shift+Z
    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    global.fetch = origFetch;
  });

  it("redoes via Meta+Shift+Z (Mac)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });

    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "KB Redo Mac" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=rmac111");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    await within(list).findByRole("listitem");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // undo
    input.blur();
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo via Meta+Shift+Z
    fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    global.fetch = origFetch;
  });
});
