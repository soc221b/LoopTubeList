import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "@/App";

describe("App", () => {
  it("renders header", () => {
    render(<App />);
    expect(screen.getByText(/Loop Tube List/i)).toBeInTheDocument();
  });

  it("auto-focuses the URL input on load", () => {
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    expect(input).toHaveFocus();
  });

  it("requires the URL input", () => {
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    expect(input).toBeRequired();
  });

  it("does not add an invalid URL", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    const addButton = screen.getByRole("button", { name: /add/i });
    await user.type(input, "not-a-url");
    await user.click(addButton);
    // playlist ul should not be present when empty
    expect(screen.queryByRole("list", { name: /playlist/i })).toBeNull();
  });

  it("invalid URL format is invalid", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    await user.clear(input);
    await user.type(input, "not-a-url");
    expect(input).toBeInvalid();
  });

  it("valid URL format is valid", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    await user.clear(input);
    await user.type(input, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(input).toBeValid();
  });

  it("rejects non-YouTube URLs and shows an error", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    const addButton = screen.getByRole("button", { name: /add/i });
    await user.type(input, "https://vimeo.com/123456");
    await user.click(addButton);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/YouTube/i);
    // playlist ul should not be present when empty
    expect(screen.queryByRole("list", { name: /playlist/i })).toBeNull();
  });

  it("resets and focuses the input after adding a valid YouTube video URL", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Test Video" }),
    }) as any;
    await user.type(input, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await user.click(addButton);
    // wait for a listitem to appear
    await within(screen.getByRole("list", { name: /playlist/i })).findByRole(
      "listitem",
    );
    expect(input.value).toBe("");
    expect(input).toHaveFocus();
    global.fetch = origFetch;
  });

  it("rejects duplicate videos by youtube id", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Test Video" }),
    }) as any;
    await user.type(input, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await user.click(addButton);
    await within(screen.getByRole("list", { name: /playlist/i })).findByRole(
      "listitem",
    );
    // try to add again using youtu.be short url
    await user.clear(input);
    await user.type(input, "https://youtu.be/dQw4w9WgXcQ");
    await user.click(addButton);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/already in playlist/i);
    const list = screen.getByRole("list", { name: /playlist/i });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(1);
    global.fetch = origFetch;
  });

  it("does not trigger oEmbed twice when submitting same url quickly via the UI", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /add/i });
    const origFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Test Video" }),
    });
    global.fetch = fetchMock as any;
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    await user.type(input, url);
    await user.click(addButton);
    await within(screen.getByRole("list", { name: /playlist/i })).findByRole(
      "listitem",
    );
    // submit again quickly
    await user.clear(input);
    await user.type(input, url);
    await user.click(addButton);
    // ensure underlying fetch was not called twice
    expect(fetchMock).toHaveBeenCalledTimes(1);
    global.fetch = origFetch;
  });
});
