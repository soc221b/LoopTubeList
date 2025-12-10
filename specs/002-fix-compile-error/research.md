```markdown
# Research: Fix Dev Server Compile Error

**Decision**: Target Node.js 18.x (LTS) and rely on `next build` as the CI smoke check. Root cause classification will be determined by reproducing the error locally; expected likely causes include TypeScript type errors in `components/` or Next/PostCSS config issues.

**Rationale**:
- Node 18 is a stable LTS line compatible with dependencies in `package.json` (Next 13, TypeScript 5). Using a consistent Node version reduces environment-specific failures.
- Running `npm run build` (Next's production build) in CI reliably surfaces compile-time errors and is faster and more robust for automated checks than attempting to run `next dev` headlessly.

**Alternatives considered**:
- Run `next dev` in CI and attempt a headless smoke — rejected because `next dev` is intended for interactive development and is less deterministic in CI.
- Bump Next.js or TypeScript versions — deferred unless the reproduction demonstrates incompatibility that requires an upgrade.

**Implementation tasks from research**:
1. Add `.nvmrc` specifying `18` to the repository for local environment parity.
2. Add a CI job (e.g., GitHub Actions) to run `npm ci` and `npm run build` to detect compile failures early.
3. Reproduce locally and classify root cause. If TypeScript typing is the cause, add a targeted unit test or type-check-only CI job.

## Root Cause (Investigation)

Reproduced the failure by running `npm ci` and `npm run build`. Build failed with these diagnostics:

- `next/font` error: Unknown font `Geist`
- `next/font` error: Unknown font `Geist Mono`

Files implicated: `app/layout.tsx` — the application imports `Geist` and `Geist_Mono` from `next/font/google`, but those font names are not available from the Next.js google font helper. This caused the build to fail with `Unknown font` errors.

Fix applied: Replaced the unknown imports with supported fonts from `next/font/google`:

- `Geist` → `Inter`
- `Geist_Mono` → `Fira_Code`

Rationale: Using supported font helpers resolves the `next/font` lookup error without requiring a font upload or additional dependency. The change is minimal and keeps the CSS variable names unchanged (`--font-geist-sans`, `--font-geist-mono`) so downstream CSS continues to work.

Verification: After the change, `npm run build` completes successfully and static pages are generated.


```
