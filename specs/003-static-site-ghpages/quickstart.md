# Quickstart: Build & Preview Static Site (Vite + React)

Prerequisites:
- Node.js (LTS) and `npm` installed
- Repository checked out locally

Install dependencies:

```bash
npm ci
```

Local dev (optional):

```bash
npm run dev
# (starts Vite dev server; this is for development only)
```

Build to `docs/` (production):

You can either add the script below to your `package.json` or run the command directly.

Add to `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:docs": "vite build --outDir docs",
  "preview:docs": "npx http-server docs -p 3000"
}
```

Run the build that emits to `docs/`:

```bash
npm run build:docs
```

Preview the built site locally:

```bash
npx http-server docs -p 3000
# or
npx serve docs -p 3000
# or (python)
python3 -m http.server 3000 --directory docs
```

Notes & tips:
- Vite config: set `base: './'` and `build.outDir = 'docs'` in `vite.config.ts` so relative assets work on GitHub Pages.
- CI: Add a GitHub Actions job to run `npm ci` and `npm run build:docs` and fail if the build errors. Add a small smoke check that `docs/index.html` exists and contains expected text.
- Publishing: The simplest repository-hosted approach is to commit `docs/` to `main`. You can automate this in a workflow but confirm branch protection rules allow it.
