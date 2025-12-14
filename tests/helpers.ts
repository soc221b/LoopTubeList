import { act, screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

export async function expectPlaylistToHaveLength(n: number) {
  if (n === 0) {
    expect(screen.queryByRole("list", { name: /playlist/i })).toBeNull();
    return;
  }
  const list = await screen.findByRole("list", { name: /playlist/i });
  expect(within(list).queryAllByRole("listitem")).toHaveLength(n);
}

export async function getPlaylistItem(nth: number) {
  const list = await screen.findByRole("list", { name: /playlist/i });
  const items = within(list).getAllByRole("listitem");
  expect(items.length).toBeGreaterThanOrEqual(nth);
  return items[nth];
}

export async function playPlaylistItem(user: UserEvent, nth: number) {
  const item = await getPlaylistItem(nth);
  const playButton = within(item).getByRole("button", { name: /play/i });
  await user.click(playButton);
}

export async function reviewPlaylistItem(user: UserEvent, nth: number) {
  const item = await getPlaylistItem(nth);
  const reviewButton = within(item).getByRole("button", { name: /reviewed/i });
  await user.click(reviewButton);
}

export async function resetPlaylistItem(user: UserEvent, nth: number) {
  const item = await getPlaylistItem(nth);
  const resetButton = within(item).getByRole("button", { name: /reset/i });
  await user.click(resetButton);
}

export async function removePlaylistItem(user: UserEvent, nth: number) {
  const item = await getPlaylistItem(nth);
  const removeButton = within(item).getByRole("button", { name: /remove/i });
  await user.click(removeButton);
}

export async function expectPlaylistItemToHaveReviews(
  nth: number,
  reviews: number,
) {
  const item = await getPlaylistItem(nth);
  expect(
    within(item).getByText(new RegExp(`Reviews:\\s*${reviews}\\b`)),
  ).toBeInTheDocument();
}
