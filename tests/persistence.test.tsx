import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";
import { expectPlaylistToHaveLength } from "./helpers";

it("persists playlist across refresh", async () => {
  const user = userEvent.setup();
  const origFetch = global.fetch;
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ title: "Persisted Video" }),
  }) as any;
  const { unmount } = render(<App />);
  const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
  const addButton = screen.getByRole("button", { name: /add/i });
  await user.type(input, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await user.click(addButton);
  await expectPlaylistToHaveLength(1);

  unmount();
  render(<App />);

  await expectPlaylistToHaveLength(1);

  global.fetch = origFetch;
});
