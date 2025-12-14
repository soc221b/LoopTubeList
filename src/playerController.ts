let getPlayers: () => Record<string, any> = () => ({});
let getPlayingId: () => string | null = () => null;

export function registerGetPlayers(fn: () => Record<string, any>) {
  getPlayers = fn;
}

export function registerGetPlayingId(fn: () => string | null) {
  getPlayingId = fn;
}

export function stopIfPlaying(id: string) {
  try {
    if (getPlayingId && getPlayingId() === id) {
      const players = getPlayers();
      const main = players && (players as any).main;
      if (main && typeof main.stopVideo === "function") {
        main.stopVideo();
      }
    }
  } catch {}
}
