import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

export type Video = {
  id: string;
  youtubeId?: string;
  title: string;
  url: string;
  createdAt: number;
  reviewCount: number;
  nextReview: number;
};

export type PlaylistState = {
  list: Video[];
  past: Video[][];
  future: Video[][];
};

export const initialState: PlaylistState = {
  list: [],
  past: [],
  future: [],
};

export type Action =
  | { type: "add"; payload: Video }
  | { type: "set"; payload: Video[] }
  | {
      type: "update";
      payload: Partial<Video> & { id?: string; youtubeId?: string };
    }
  | { type: "reviewed"; payload: { id: string; nextReview: number } }
  | { type: "remove"; payload: { id: string } }
  | { type: "reset"; payload: { id: string; nextReview: number } }
  | { type: "undo" }
  | { type: "redo" };

export function playlistReducer(
  state: PlaylistState,
  action: Action,
): PlaylistState {
  switch (action.type) {
    case "add": {
      const v = action.payload;
      const nextList = [v, ...state.list];
      try {
        console.debug(
          "PlaylistReducer: add",
          v.youtubeId,
          "new length",
          nextList.length,
        );
      } catch {}
      return {
        past: [...state.past, state.list],
        future: [],
        list: nextList,
      };
    }
    case "set": {
      return {
        past: [...state.past, state.list],
        future: [],
        list: action.payload,
      };
    }
    case "update": {
      const update = action.payload;
      return {
        ...state,
        list: state.list.map((v) => {
          if (
            (update.youtubeId && v.youtubeId === update.youtubeId) ||
            (update.id && v.id === update.id)
          ) {
            return { ...v, ...(update as Partial<Video>) };
          }
          return v;
        }),
      };
    }
    case "reviewed": {
      const { id, nextReview } = action.payload;
      return {
        past: [...state.past, state.list],
        future: [],
        list: state.list.map((v) =>
          v.id !== id
            ? v
            : { ...v, reviewCount: v.reviewCount + 1, nextReview },
        ),
      };
    }
    case "remove": {
      const { id } = action.payload;
      return {
        past: [...state.past, state.list],
        future: [],
        list: state.list.filter((v) => v.id !== id),
      };
    }
    case "reset": {
      const { id, nextReview } = action.payload;
      return {
        past: [...state.past, state.list],
        future: [],
        list: state.list.map((v) =>
          v.id !== id ? v : { ...v, reviewCount: 0, nextReview },
        ),
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, state.past.length - 1),
        future: [state.list, ...state.future],
        list: previous,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        future: state.future.slice(1),
        past: [...state.past, state.list],
        list: next,
      };
    }
    default:
      return state;
  }
}

const PlaylistStateContext = createContext<PlaylistState | undefined>(
  undefined,
);
const PlaylistDispatchContext = createContext<
  React.Dispatch<Action> | undefined
>(undefined);

export function PlaylistProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: PlaylistState;
}) {
  const [state, dispatch] = useReducer(
    playlistReducer,
    initial ?? initialState,
  );
  return (
    <PlaylistStateContext.Provider value={state}>
      <PlaylistDispatchContext.Provider value={dispatch}>
        {children}
      </PlaylistDispatchContext.Provider>
    </PlaylistStateContext.Provider>
  );
}

export function usePlaylist() {
  const ctx = useContext(PlaylistStateContext);
  if (!ctx)
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  return ctx;
}

export function usePlaylistDispatch() {
  const ctx = useContext(PlaylistDispatchContext);
  if (!ctx)
    throw new Error(
      "usePlaylistDispatch must be used within a PlaylistProvider",
    );
  return ctx;
}
