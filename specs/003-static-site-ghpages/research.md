## Research: Static Site (Vite + React) for GitHub Pages

Decision: Use Vite + React (no Next.js). Configure Vite to emit the production build into `docs/` (project root) and use a relative `base` so asset URLs resolve correctly when served from GitHub Pages. Provide a small GitHub Actions CI job to validate the build and optionally publish `docs/` to `main`.

Rationale:
- Vite is fast, has minimal runtime/dependencies, and produces static assets suitable for GitHub Pages. It aligns with the project's constitution (favor minimal dependencies and simplicity).
- React is already the project's UI library and provides a familiar developer experience.
- Emitting directly to `docs/` satisfies the requirement that the repository contain the static artifacts under `main/docs`.
- Using a relative `base` (e.g., `base: './'`) avoids hard-coding repository names and works when previewing the site locally from `docs/`.

Alternatives Considered:
- Next.js (SSG): Powerful, but adds significant complexity and server-oriented tooling; unnecessary when the site is purely static "without data".
- Deploying using a separate `gh-pages` branch or an external deployment action: viable, but the spec requires `main` + `/docs`. If commit-history pollution is a concern, switch later to `gh-pages` publishing flow.
- Using `dist/` then copying files into `docs/` as a separate step: functionally equivalent; configuring Vite to write directly to `docs/` is simpler and reproducible.

CI & Publishing Strategy (summary):
- CI validation: Add a GitHub Actions job that runs on `push` and `pull_request` to install dependencies and run `vite build --outDir docs` (or `npm run build:docs`). The job must fail the pipeline if the build errors.
- Optional publishing: If you want the repository to contain built artifacts automatically on `main`, add a workflow step that commits and pushes the `docs/` contents back to `main` (use the default `GITHUB_TOKEN`). This requires branch-policy considerations (assumed allowed per spec).

Vite Config Notes:
- Set `base` to `'./'` to use relative asset paths.
- Set `build.outDir` to `'docs'` so `vite build` writes directly to the repository folder that GitHub Pages serves.

Example `vite.config.ts` snippet:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
})
```

Smoke/Validation Checks:
- CI should assert that `docs/index.html` exists and contains expected heading or project title (simple grep or node script).
- Existing accessibility tests in `tests/a11y/` should continue to run against the built markup or during the component test runs.

Decision Summary:
- Technology: Vite + React
- Build output: `docs/` at repo root
- Asset strategy: relative `base` to support GitHub Pages and local preview
- CI: build validation + optional commit/publish step
