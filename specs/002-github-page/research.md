# research.md

Decision: Use GitHub Actions official Pages deployment (upload-pages-artifact + github-pages)

Rationale: The official GitHub Actions Pages flow (actions/configure-pages + actions/upload-pages-artifact + actions/deployment) is maintained by GitHub, supports custom domains, atomic artifact uploads, and integrates with repository settings without requiring an extra deployment branch. It keeps history in Actions and produces structured logs for auditing.

Alternatives considered:
- gh-pages (npm) / gh-pages branch: simple but requires a separate branch and can complicate history; less preferred for CI-driven deployments.
- peaceiris/actions-gh-pages: widely used but third-party; requires pushing to a branch or using an SSH deploy key.

Decision: For local/manual deploy, recommend GitHub CLI `gh` (preferred) with fallback to `gh-pages` npm package for environments without `gh`.

Rationale for local choice: `gh` is first-party and supports `gh pages deploy ./dist`. `gh-pages` is a lightweight npm package for developers who prefer an npm script.

Implementation notes:
- CI workflow will build with `npm run build` and upload `dist/` using `actions/upload-pages-artifact@v3`.
- The Pages deployment step will use `actions/deploy-pages@v1` (or the canonical actions recommended by GitHub at the time of implementation).
- Ensure the workflow includes lint and tests before the publish step to satisfy Constitution testing gates.
