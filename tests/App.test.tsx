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
    const list = screen.getByRole('list', { name: /playlist/i });
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

  it("rejects non-YouTube URLs and shows an error", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.type(input, 'https://vimeo.com/123456');
    await user.click(addButton);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/YouTube/i);
    const list = screen.getByRole('list', { name: /playlist/i });
    expect(within(list).queryAllByRole('listitem')).toHaveLength(0);
  });

  it("rejects non-video YouTube pages (homepage/channel)", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/YouTube URL/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    // homepage
    await user.type(input, 'https://www.youtube.com/');
    await user.click(addButton);
    let alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/video/i);
    // channel
    await user.clear(input);
    await user.type(input, 'https://www.youtube.com/channel/UCabcdef');
    await user.click(addButton);
    alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/video/i);
    const list = screen.getByRole('list', { name: /playlist/i });
    expect(within(list).queryAllByRole('listitem')).toHaveLength(0);
  });
});
