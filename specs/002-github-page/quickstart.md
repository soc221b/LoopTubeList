# quickstart.md

1) Build the site locally

```bash
npm install
npm run build
```

2) Deploy locally (preferred: GitHub CLI)

- Using GitHub CLI (recommended):
  - Ensure `gh` is authenticated (gh auth login)
  - Run: `gh pages deploy ./dist --branch gh-pages --message "local deploy"` OR `gh pages deploy ./dist` to let GitHub choose defaults

- Fallback using npm `gh-pages` package:
  - Install: `npm i -D gh-pages`
  - Add script: `"deploy:local": "gh-pages -d dist -m \"local deploy\""`
  - Run: `npm run deploy:local`

3) CI-driven publish (recommended)

- Add workflow `.github/workflows/pages.yml` (example in repository) that runs on push to the repository default branch (do not hardcode `main`; use `${{ github.event.repository.default_branch }}` or configure the branch in workflow inputs) and performs:
  - checkout
  - install dependencies
  - lint
  - run tests (unit + e2e/stub)
  - npm run build
  - run a validation step (fail if `dist/index.html` is missing)
  - actions/upload-pages-artifact@v3 (upload dist)
  - actions/deploy-pages@v1 (deploy uploaded artifact)

- Post-deploy verification: workflow should emit a concise Actions summary including the published Pages URL and upload `artifacts/deployment-record.json` (see spec) so maintainers can verify commit SHA, timestamp, artifactSizeBytes, and status. If validation fails, the workflow should not invoke the deploy step and should surface logs/summary for maintainers.
4) Custom domain support

- Add a `CNAME` file into the `dist/` root or configure repository Pages settings with the custom domain.
- Document DNS configuration and verification steps in this quickstart.

5) Troubleshooting

- If publish fails, check Actions run logs and confirm the build produced `index.html` in `dist/`.
- For DNS issues, verify A/ALIAS/CNAME records and propagation; see GitHub Pages custom domain docs.
