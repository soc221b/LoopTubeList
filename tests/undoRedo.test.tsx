import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";

describe("undo/redo", () => {
  it("undoes and redoes adding a video", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "Undo Test" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=aaa111");
    await user.click(addButton);
    await within(screen.getByRole("list", { name: /playlist/i })).findByRole("listitem");

    const list = screen.getByRole("list", { name: /playlist/i });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // undo
    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // redo
    await user.click(screen.getByRole("button", { name: /redo/i }));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    global.fetch = origFetch;
  });

  it("undoes and redoes reviewing", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "Review Test" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=bbb222");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    const item = await within(list).findByRole("listitem");

    // initial reviews 0
    expect(within(item).getByText(/Reviews: 0/)).toBeInTheDocument();

    // review once
    await user.click(within(item).getByRole("button", { name: /reviewed/i }));
    expect(within(item).getByText(/Reviews: 1/)).toBeInTheDocument();

    // undo the review
    await user.click(screen.getByRole("button", { name: /undo/i }));
    const itemAfterUndo = await within(list).findByRole("listitem");
    expect(within(itemAfterUndo).getByText(/Reviews: 0/)).toBeInTheDocument();

    // redo the review
    await user.click(screen.getByRole("button", { name: /redo/i }));
    const itemAfterRedo = await within(list).findByRole("listitem");
    expect(within(itemAfterRedo).getByText(/Reviews: 1/)).toBeInTheDocument();

    global.fetch = origFetch;
  });

  it("undoes and redoes reset", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "Reset Test" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=ccc333");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    const item = await within(list).findByRole("listitem");

    // increase reviews twice
    await user.click(within(item).getByRole("button", { name: /reviewed/i }));
    await user.click(within(item).getByRole("button", { name: /reviewed/i }));
    expect(within(item).getByText(/Reviews: 2/)).toBeInTheDocument();

    // reset
    await user.click(within(item).getByRole("button", { name: /reset/i }));
    const afterReset = await within(list).findByRole("listitem");
    expect(within(afterReset).getByText(/Reviews: 0/)).toBeInTheDocument();

    // undo reset -> back to 2
    await user.click(screen.getByRole("button", { name: /undo/i }));
    const afterUndo = await within(list).findByRole("listitem");
    expect(within(afterUndo).getByText(/Reviews: 2/)).toBeInTheDocument();

    // redo reset
    await user.click(screen.getByRole("button", { name: /redo/i }));
    const afterRedo = await within(list).findByRole("listitem");
    expect(within(afterRedo).getByText(/Reviews: 0/)).toBeInTheDocument();

    global.fetch = origFetch;
  });

  it("undoes and redoes remove", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "Remove Test" }) }) as any;

    await user.type(input, "https://www.youtube.com/watch?v=ddd444");
    await user.click(addButton);
    const list = screen.getByRole("list", { name: /playlist/i });
    await within(list).findByRole("listitem");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // remove
    await user.click(within(await within(list).findByRole("listitem")).getByRole("button", { name: /remove/i }));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    // undo remove -> item back
    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);

    // redo remove
    await user.click(screen.getByRole("button", { name: /redo/i }));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);

    global.fetch = origFetch;
  });
});
