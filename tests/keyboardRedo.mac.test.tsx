import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";

describe("keyboard redo (Mac)", () => {
  it("redoes via Meta+Shift+Z", async () => {
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
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo via Meta+Shift+Z
    fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    global.fetch = origFetch;
  });
});
