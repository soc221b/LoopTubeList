import React from "react";
import { render, screen } from "@testing-library/react";
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
});
