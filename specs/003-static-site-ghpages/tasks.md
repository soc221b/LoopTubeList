---
description: "Generated task list for Static Site (GitHub Pages) - Vite + React"
---

# Tasks: Static Site (GitHub Pages)

**Input**: Design documents from `/specs/003-static-site-ghpages/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`

## Phase 1: Setup (Shared Infrastructure)

Purpose: Project-level configuration so the repo can build a static site with Vite + React and emit artifacts into `docs/`.

- [ ] T001 Create Vite config `vite.config.ts` with `base: './'` and `build.outDir = 'docs'` at project root (`/vite.config.ts`)
- [ ] T002 [P] Add build & preview scripts to `package.json` (`/package.json`) — add `dev`, `build`, `build:docs`, and `preview:docs` entries per quickstart
- [ ] T003 [P] Add a lightweight `index.html` entry for Vite (if missing) at `/index.html` or ensure existing app entrypoint is compatible with Vite (`/index.html`)
- [ ] T004 [P] Add `scripts/` helper folder and create `scripts/smoke-check.sh` to validate `docs/index.html` contains expected text (`/scripts/smoke-check.sh`)

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: Core automation and CI checks that MUST be present before user stories.

⚠️ CRITICAL: These tasks block user story implementation until complete.

- [ ] T005 Create GitHub Actions workflow to validate build (`.github/workflows/validate-build.yml`) that runs on `pull_request` and `push` and executes: `npm ci`, `npm run build:docs`, and `scripts/smoke-check.sh`
- [ ] T006 Add a small CI smoke test script `scripts/verify-docs.js` (Node) or `scripts/verify-docs.sh` (shell) that asserts `docs/index.html` exists and contains the project title or expected text (`/scripts/verify-docs.sh`)
- [ ] T007 [P] Update `specs/003-static-site-ghpages/quickstart.md` to reference the exact `package.json` scripts and preview commands (`/specs/003-static-site-ghpages/quickstart.md`)

**Checkpoint**: CI must fail when `npm run build:docs` fails or when `docs/index.html` is missing/incorrect.

---

## Phase 3: User Story 1 - Publish Static Site (Priority: P1) 🎯 MVP

Goal: Produce a reproducible static build into `docs/` and ensure CI validates the build artifacts so PRs cannot merge a failing static build.

Independent Test: Run `npm run build:docs` locally to produce `docs/`, then run `scripts/smoke-check.sh` (or `npm run preview:docs` + HTTP check) and confirm `docs/index.html` contains expected text.

- [ ] T008 [US1] Implement `npm run build:docs` invocation in CI workflow so PRs run the build and produce `docs/` (`.github/workflows/validate-build.yml`)
- [ ] T009 [P] [US1] Add smoke-check implementation at `/scripts/smoke-check.sh` that checks `docs/index.html` contains the repository/project title or expected string and exits non-zero on failure (`/scripts/smoke-check.sh`)
- [ ] T010 [US1] Add a docs README `docs/README.md` that documents the build output and how GitHub Pages serves `docs/` (`/docs/README.md`)
- [ ] T011 [US1] Add an optional publish workflow template `.github/workflows/publish-docs.yml` (disabled by default) that, when enabled and branch policy allows, commits `docs/` to `main` or otherwise publishes to GitHub Pages (`.github/workflows/publish-docs.yml`)

**Checkpoint**: After T008–T010, the CI should validate builds and smoke checks; the `docs/` directory produced locally must contain `index.html` and assets.

---

## Phase 4: User Story 2 - Local Preview & Validation (Priority: P2)

Goal: Make it easy for contributors to build locally and preview the static site from `docs/`.

Independent Test: Run `npm run build:docs` and `npm run preview:docs`, open `http://localhost:3000/` and confirm homepage renders and navigation works.

- [ ] T012 [P] [US2] Add `preview:docs` script to `package.json` that runs a static server (e.g., `npx http-server docs -p 3000`) (`/package.json`)
- [ ] T013 [US2] Add `docs/` preview instructions in `README.md` (repo root) and in `/specs/003-static-site-ghpages/quickstart.md` (`/README.md`, `/specs/003-static-site-ghpages/quickstart.md`)
- [ ] T014 [US2] Add tests/instructions for local smoke validation (optional small script `scripts/preview-verify.sh` that requests `/` and checks HTTP 200) (`/scripts/preview-verify.sh`)

**Checkpoint**: Contributors can run `npm run build:docs` and `npm run preview:docs` to validate local output.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T015 [P] Update repository root `README.md` with a short note and link to the GitHub Pages site and build instructions (`/README.md`)
- [ ] T016 [P] Add accessibility checklist and ensure a11y tests remain part of CI (`/tests/a11y/` and `.github/workflows/validate-build.yml`)
- [ ] T017 [P] Add `specs/003-static-site-ghpages/tasks.md` to the feature docs (this file) and cross-link to `plan.md`, `quickstart.md`, and `research.md` (`/specs/003-static-site-ghpages/tasks.md`)

---

## Dependencies & Execution Order

- Phase 1 (Setup) must run first. Phase 2 (Foundational) blocks all user stories.
- User Story 1 (P1) work (Phase 3) begins after Foundational tasks complete.
- User Story 2 (P2) (Phase 4) can proceed after Foundational tasks and can run in parallel with US1 tasks that are not dependent on shared files.

### Story Completion Order (recommended)
1. Foundation (T005–T007)
2. US1: Build validation & smoke checks (T008–T010) — MVP deliverable
3. US2: Local preview & instructions (T012–T014)
4. Polish & docs (T015–T017)

## Parallel execution examples

- While Phase 2 is being completed, create `scripts/smoke-check.sh` (T004) and `scripts/verify-docs.sh` (T006) in parallel since they are independent files. Marked `[P]` above.
- Multiple developers: one author implements CI workflow (T005/T008) while another adds `vite.config.ts` (T001) and `package.json` scripts (T002/T012).

## Implementation strategy

- MVP: Deliver User Story 1 only. Complete Phase 1 + Phase 2, then deliver Phase 3 (US1) and verify CI smoke checks pass. Stop and validate the published `docs/` content before automating publishing to `main`.
- Incremental: After MVP, add local preview (US2) and polish docs & accessibility checks.

## Validation checklist (format enforcement)

- All tasks use the checklist format: `- [ ] T### [P?] [US?] Description with file path`.
- Each user-story task includes a story label `[US1]` or `[US2]`.
- Setup and Foundational tasks do not include story labels.

---

Generated by the speckit.tasks workflow from `/specs/003-static-site-ghpages/`.
