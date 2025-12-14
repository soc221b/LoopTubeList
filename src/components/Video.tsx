import React, { useEffect, useRef } from "react";
import { usePlaylist, usePlaylistDispatch } from "@/PlaylistContext";
import { registerGetPlayers, registerGetPlayingId } from "@/playerController";

export default function VideoPlayer({
  playingId,
  setPlayingId,
}: {
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
}) {
  const { list } = usePlaylist();
  const dispatch = usePlaylistDispatch();
  const playersRef = useRef<any>({ main: null, ready: false });
  const pendingYoutubeRef = useRef<string | null>(null);
  const shouldPlayRef = useRef(false);
  const prevListRef = useRef<Record<string, number>>({});
  const playingIdRef = useRef<string | null>(playingId);
  const lastLoadedRef = useRef<string | null>(null);
  const creatingRef = useRef(false);
  const listRef = useRef(list);
  useEffect(() => {
    listRef.current = list;
  }, [list]);
  const skipNextPlayingIdRef = useRef<string | null>(null);

  // expose players and playing id getters for other parts (e.g., to stop on review)
  useEffect(() => {
    registerGetPlayers(() => playersRef.current);
    registerGetPlayingId(() => playingIdRef.current);
    return () => {
      registerGetPlayers(() => ({}));
      registerGetPlayingId(() => null);
    };
  }, []);

  useEffect(() => {
    playingIdRef.current = playingId;
  }, [playingId]);

  function getVideoById(id: string | null) {
    if (!id) return undefined;
    return list.find((v) => v.id === id);
  }

  function createPlayer(youtubeId?: string) {
    try {
      const YT = (window as any).YT;
      const elemId = `player-iframe`;
      if (YT && YT.Player) {
        if (
          !playersRef.current.main ||
          typeof playersRef.current.main.getVideoData !== "function"
        ) {
          // prevent double-creating player when effects double-run (StrictMode)
          if (creatingRef.current) return;
          creatingRef.current = true;
          const player = YT.Player(elemId, {
            events: {
              onReady: (e: any) => {
                try {
                  playersRef.current.main =
                    e && e.target ? e.target : playersRef.current.main;
                  // mark the player as ready
                  playersRef.current.ready = true;
                  try {
                    (window as any).__YT_PLAYER__ = playersRef.current.main;
                  } catch {}
                } catch {}
                // if there was a pending youtube id to load, load it now (but avoid duplicate loads)
                try {
                  const pending = pendingYoutubeRef.current;
                  if (
                    pending &&
                    playersRef.current.main &&
                    playersRef.current.ready &&
                    playersRef.current.main.loadVideoById &&
                    lastLoadedRef.current !== pending
                  ) {
                    playersRef.current.main.loadVideoById(pending);
                    lastLoadedRef.current = pending;
                    if (
                      shouldPlayRef.current &&
                      playersRef.current.main.playVideo
                    )
                      playersRef.current.main.playVideo();
                  }
                } catch {}
                creatingRef.current = false;
              },
              onStateChange: (ev: any) => {
                try {
                  const stateEnded =
                    YT.PlayerState && ev && ev.data === YT.PlayerState.ENDED;
                  if (stateEnded) {
                    // find current video id from player
                    let currentId: string | undefined;
                    try {
                      const info = playersRef.current.main.getVideoData();
                      if (info && info.video_id) currentId = info.video_id;
                    } catch {}
                    if (currentId) handleVideoEndedByYoutubeId(currentId);
                  }
                } catch {}
              },
            },
          });
          // the mock returns instance; ensure we store it
          playersRef.current.main = playersRef.current.main || player;
          try {
            (window as any).__YT_PLAYER__ = playersRef.current.main;
          } catch {}
        } else {
          // existing player: load new id if provided, but avoid reloading same id
          try {
            if (youtubeId) {
              if (
                playersRef.current.ready &&
                playersRef.current.main.loadVideoById
              ) {
                try {
                  const current =
                    playersRef.current.main.getVideoData &&
                    playersRef.current.main.getVideoData();
                  const currentId =
                    current && current.video_id ? current.video_id : null;
                  if (
                    currentId !== youtubeId &&
                    lastLoadedRef.current !== youtubeId
                  ) {
                    playersRef.current.main.loadVideoById(youtubeId);
                    lastLoadedRef.current = youtubeId;
                  }
                } catch {
                  playersRef.current.main.loadVideoById(youtubeId);
                  lastLoadedRef.current = youtubeId;
                }
              } else {
                // not ready yet: set as pending to load when ready
                pendingYoutubeRef.current = youtubeId;
              }
            }
          } catch {}
        }
      }
    } catch {}
  }

  function handleVideoEndedByYoutubeId(youtubeId: string) {
    // find video
    const currentList = listRef.current;
    const found = currentList.find((v) => v.youtubeId === youtubeId);
    if (!found) return;
    const now = Date.now();
    const next = [...currentList]
      .sort((a, b) => a.nextReview - b.nextReview)
      .find(
        (v) =>
          v.youtubeId !== youtubeId &&
          (v.reviewCount === 0 || v.nextReview <= now),
      );

    // prepare pending load for next early to avoid races with other effects
    if (next && next.youtubeId) {
      pendingYoutubeRef.current = next.youtubeId;
      shouldPlayRef.current = true;
    }

    // dispatch reviewed for found
    dispatch({
      type: "reviewed",
      payload: { id: found.id, nextReview: Date.now() },
    });

    if (next) {
      // attempt to directly prepare and load the next video to avoid races
      try {
        if (next.youtubeId) {
          // try to create or reuse player (do not pass id to avoid duplicate auto-load)
          createPlayer();
          if (
            playersRef.current.ready &&
            playersRef.current.main &&
            playersRef.current.main.loadVideoById
          ) {
            // load the next id (pending was set above)
            playersRef.current.main.loadVideoById(next.youtubeId);
            lastLoadedRef.current = next.youtubeId;
            try {
              playersRef.current.main.playVideo &&
                playersRef.current.main.playVideo();
            } catch {}
            // mark to skip the immediate playingId effect load that would otherwise duplicate
            try {
              skipNextPlayingIdRef.current = next.id;
            } catch {}
            setPlayingId(next.id);
            return;
          }
          // fallback: pending is already set above for the playingId effect/onReady
        }
      } catch {}
      setPlayingId(next.id);
    } else setPlayingId(null);
  }

  // when playingId changes, ensure player loads and optionally plays
  useEffect(() => {
    const v = getVideoById(playingId);
    if (v && v.youtubeId) {
      // if player exists and is functional, load and play
      const main = playersRef.current.main;
      // allow handleVideoEnded to short-circuit the playingId effect when it already loaded/played
      if (
        skipNextPlayingIdRef.current &&
        skipNextPlayingIdRef.current === v.id
      ) {
        skipNextPlayingIdRef.current = null;
        return;
      }
      pendingYoutubeRef.current = v.youtubeId;
      shouldPlayRef.current = true;
      if (main && playersRef.current.ready) {
        try {
          const loadId = pendingYoutubeRef.current || v.youtubeId;
          if (loadId && main.loadVideoById) {
            try {
              const info = main.getVideoData && main.getVideoData();
              const currentId = info && info.video_id ? info.video_id : null;
              if (currentId !== loadId && lastLoadedRef.current !== loadId) {
                main.loadVideoById(loadId);
                lastLoadedRef.current = loadId;
              }
            } catch {
              main.loadVideoById(loadId);
              lastLoadedRef.current = loadId;
            }
          }
          main.playVideo && main.playVideo();
        } catch {}
      } else {
        // if player exists but not ready, mark pending id and let onReady handle loading
        if (main && !playersRef.current.ready) {
          pendingYoutubeRef.current = v.youtubeId;
          shouldPlayRef.current = true;
        } else createPlayer(v.youtubeId);
      }
    }
  }, [playingId]);

  // stop player when the currently playing item's reviewCount increased (i.e., was reviewed)
  useEffect(() => {
    const map: Record<string, number> = {};
    list.forEach((v) => (map[v.id] = v.reviewCount));
    const prev = prevListRef.current;
    if (playingId) {
      const prevCount = prev[playingId] ?? null;
      const curCount = map[playingId];
      if (prevCount !== null && curCount > prevCount) {
        try {
          playersRef.current.main &&
            playersRef.current.main.stopVideo &&
            playersRef.current.main.stopVideo();
        } catch {}
      }
    }
    prevListRef.current = map;
  }, [list, playingId]);

  // Run once when the list becomes non-empty (covers both synchronous initial load and async hydration).
  // This avoids auto-creating the player on subsequent user-driven additions.
  const didInitPending = useRef(false);
  useEffect(() => {
    try {
      if (didInitPending.current) return;
      if (!list || list.length === 0) return;
      const now = Date.now();
      const pending = [...list]
        .sort((a, b) => a.nextReview - b.nextReview)
        .find((v) => v.reviewCount === 0 || v.nextReview <= now);
      if (pending && pending.youtubeId) {
        // prepare to load it when player becomes ready
        pendingYoutubeRef.current = pending.youtubeId;
        shouldPlayRef.current = false;
        createPlayer(pending.youtubeId);
      }
      didInitPending.current = true;
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return (
    <div style={{ marginBottom: 12, display: playingId ? undefined : "none" }}>
      <iframe
        data-testid="player-iframe"
        id={`player-iframe`}
        title={`player-iframe`}
        src={`https://www.youtube.com/embed/?enablejsapi=1`}
        width={560}
        height={315}
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}
