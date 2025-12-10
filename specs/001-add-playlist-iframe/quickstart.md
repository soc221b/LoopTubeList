# Quickstart: Play YouTube Playlist via Iframe (MVP)

To try the MVP locally (static frontend):

1. Open the `public/` directory in a browser, or serve it with a minimal static server.

Example (recommended): run a simple HTTP server and open the page:

```bash
cd public
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

2. On the page, paste a YouTube playlist URL (examples in `research.md`) and click Play.

Notes:
- The MVP is frontend-only; no build step required. If you prefer a packaged version with a bundler, we can add one.
- If the playlist is private or not embeddable, YouTube may show an error inside the iframe.
