# Research: Play YouTube Playlist via Iframe

This document resolves design questions required to implement the MVP: which URL formats to accept, how to construct the embeddable URL, basic security considerations, and whether to use the YouTube IFrame Player API.

----

Decision: Use a frontend-only single-page implementation (vanilla HTML/CSS/JS) that extracts the `list` query parameter from common YouTube URLs and constructs a standard embed URL.

Rationale: Minimal dependencies make the MVP easy to run locally and deploy (static hosting). Extracting `list` covers the vast majority of playlist entry points (playlist pages, watch pages with `&list=`, and shortened share URLs that include `list`), and constructing an iframe `src` is sufficient to start playback for embeddable playlists.

Alternatives considered:
- Use a backend to proxy or validate playlist IDs. Rejected for MVP due to extra hosting complexity and no clear need for server-side processing.
- Use a frontend framework (React/Vue). Rejected for MVP due to added build tooling; vanilla JS keeps the project lightweight.

----

Decision: Supported input formats and extraction rule

Rationale: Users paste a variety of YouTube links; supporting the `list` query parameter across common URL forms provides broad coverage.

Supported examples (all should be accepted):
- `https://www.youtube.com/playlist?list=PLAYLIST_ID`
- `https://youtube.com/playlist?list=PLAYLIST_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID`
- `https://youtu.be/VIDEO_ID?list=PLAYLIST_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&ab_channel=...&list=PLAYLIST_ID`

Extraction approach: find the `list` query parameter using a safe parse or a regex fallback. Pattern: `list=([A-Za-z0-9_-]+)` and limit accepted ID length (e.g., <= 128 chars) as a sanity check.

Alternatives considered:
- Attempt to resolve playlist IDs via YouTube Data API. Rejected for MVP because it requires API keys, quotas, and backend or client-side API keys (not desirable).

----

Decision: Embed URL format

Chosen embed URL: `https://www.youtube.com/embed?listType=playlist&list=PLAYLIST_ID`

Rationale: This pattern reliably embeds a playlist using the standard YouTube embed mechanism. It avoids exposing extra query parameters from the user-supplied URL and keeps the iframe `src` controlled by the app.

Alternatives considered:
- `/embed/videoseries?list=PLAYLIST_ID` — also works in many cases; either form is acceptable. Use the `embed?listType=playlist` form for clarity.

----

Decision: Error detection and player API

Rationale: For MVP, do not include the YouTube IFrame Player API. Instead, rely on iframe embed behavior for playback; present clear user-facing messages when the input is invalid or when the iframe visibly contains a YouTube error (private/un-embeddable). The IFrame Player API is an upgrade path for more robust error events and programmatic control.

Alternatives considered:
- Use the YouTube IFrame Player API to listen for `onError` events and provide richer error handling. This provides better feedback for un-embeddable playlists but adds another script and slightly more complexity.

----

Decision: Security and XSS handling

Rationale: Treat user input as untrusted. Never inject user input into HTML via `innerHTML`. Set iframe `src` via DOM properties (`iframe.src = embedUrl`) after validating the playlist ID against the allowed pattern. Escape or reject suspicious inputs. Limit input length and trim whitespace.

Alternatives considered:
- Sanitizing libraries (DOMPurify) — useful if rendering HTML from user-supplied text; for this MVP we avoid rendering arbitrary HTML so a small validation + controlled iframe assignment is sufficient.

----

Deliverable implications

- Implementation: simple `index.html`, `css/style.css`, `js/app.js` with a function to parse input, extract `list`, validate, and create/replace an iframe with the controlled embed URL.
- Testing: Manual tests with example playlist URLs and malformed inputs. Optional unit test for the parsing function.
