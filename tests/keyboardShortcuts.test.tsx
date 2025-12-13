import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";

describe("keyboard shortcuts", () => {
  it("supports undo/redo via keyboard (Ctrl/Cmd+Z, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });

    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "KB Test" }) }) as any;

    // add an item
    await user.type(input, "https://www.youtube.com/watch?v=kb111");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    await within(list).findByRole("listitem");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // undo via Ctrl+Z
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo via Ctrl+Y
    fireEvent.keyDown(window, { key: "y", ctrlKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // undo via Meta+Z (Mac)
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo via Ctrl+Shift+Z
    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    global.fetch = origFetch;
  });
});
