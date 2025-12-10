# Data Model: Play YouTube Playlist via Iframe

This feature is frontend-only and has minimal domain data. The "data model" below describes the small set of client-side entities and their validation rules.

## Entities

- PlaylistInput
  - Description: Raw input string typed or pasted by the user.
  - Fields:
    - `value` (string) — raw user input
    - `trimmed` (string) — `value.trim()`
    - `submittedAt` (ISO timestamp) — when user submitted
  - Validation:
    - Non-empty after trimming
    - Max length: 1024 characters (sanity)

- PlaylistID
  - Description: Parsed YouTube playlist identifier extracted from `PlaylistInput`.
  - Fields:
    - `id` (string) — matched playlist id (pattern: `[A-Za-z0-9_-]+`)
    - `sourceFormat` (enum) — one of `playlist-url`, `watch-with-list`, `short-url`, `unknown`
  - Validation:
    - Matches regex `/^[A-Za-z0-9_-]{3,128}$/`

- EmbedState
  - Description: Current state of the embedded player
  - Fields:
    - `visible` (boolean)
    - `isPlaying` (boolean | unknown) — best-effort; may not be available without player API
    - `lastError` (nullable string) — human-readable last error message

## State transitions (simple)

- Initial state: `EmbedState.visible = false`
- On valid submit: parse `PlaylistID`, set `EmbedState.visible = true`, `lastError = null`, create/replace iframe with embed `src`.
- On invalid submit: `EmbedState.visible = false`, `lastError = "Invalid playlist URL"`.
- On playback failure (player-level): set `lastError = "This playlist cannot be embedded or is private."` and optionally hide iframe.

## Notes

- No persistence is required for MVP; PlaylistInput is ephemeral.
- If the YouTube IFrame Player API is added later, `isPlaying` can be derived from player events.
