import { screen, within } from "@testing-library/react";

export async function expectPlaylistToHaveLength(n: number) {
  if (n === 0) {
    expect(screen.queryByRole("list", { name: /playlist/i })).toBeNull();
    return;
  }
  const list = await screen.findByRole("list", { name: /playlist/i });
  expect(within(list).queryAllByRole("listitem")).toHaveLength(n);
}
