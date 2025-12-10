# Constitution Check: Static Site (Vite + React)

Summary: The proposed Vite + React static site design adheres to the LoopTubeList constitution with the following considerations:

- Accessibility & User-First: No violation. The site must continue to follow semantic HTML and the existing `tests/a11y/` must run in CI against components. Add a smoke/a11y check step if the built output is validated in CI.
- Test-First Quality: No violation. CI must continue to run the repository's test suite (unit, a11y). The plan includes a build validation job which will fail the pipeline on build errors.
- Minimal Dependencies & Simplicity: Satisfied — Vite + React is a small, well-adopted toolchain and produces static artifacts.
- Observability & Error Handling: N/A for static-only content, but runtime component error handling and test coverage should remain part of normal PRs.

Gates checked:
- CI must run linting, unit tests, and a11y checks on PRs (per constitution). The implementation plan recommends adding `npm ci` + `npm run build:docs` to CI and a smoke check asserting `docs/index.html` contains expected text.

Conclusion: No constitution gates are violated by choosing Vite + React for a static site. Ensure CI includes the test and a11y checks and that any automated commit/publish steps to `main` respect branch protection rules.
