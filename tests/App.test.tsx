import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.type(input, 'not-a-url');
    await user.click(addButton);
    const list = screen.getByRole('list', { name: /watchlist/i });
    expect(within(list).queryAllByRole('listitem')).toHaveLength(0);
  });

  it("validates URL format", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    // invalid format
    await user.clear(input);
    await user.type(input, 'not-a-url');
    expect(input).toBeInvalid();
    // valid format
    await user.clear(input);
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(input).toBeValid();
  });

  it("rejects non-YouTube URLs", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.type(input, 'https://vimeo.com/123456');
    await user.click(addButton);
    // should not be added
    const list = screen.getByRole('list', { name: /watchlist/i });
    expect(within(list).queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryByText('https://vimeo.com/123456')).not.toBeInTheDocument();
  });
});
