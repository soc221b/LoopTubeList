---

description: "Task list for Spaced Repetition Playlist feature implementation"
---

# Tasks: Spaced Repetition Playlist

**Input**: Design documents from /specs/001-spaced-repetition-playlist/
**Prerequisites**: plan.md (required), spec.md (required for user stories), quickstart.md, contracts/, data-model.md (if present)

**Tests**: Tests are MANDATORY per the constitution. Test tasks MUST be included and follow a test-first approach.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Vite + React + TypeScript project and create package.json and vite.config.ts (root: package.json, vite.config.ts, tsconfig.json)
- [ ] T002 [P] Install core dependencies and devDependencies: react, react-dom, vite, zustand, tailwindcss, postcss, autoprefixer, vitest, @testing-library/react, @testing-library/jest-dom, idb-keyval (update package.json)
- [ ] T003 Configure Tailwind CSS: create tailwind.config.cjs, postcss.config.cjs and src/index.css (paths: tailwind.config.cjs, postcss.config.cjs, src/index.css)
- [ ] T004 Configure ESLint and Prettier: create .eslintrc.cjs and .prettierrc (paths: .eslintrc.cjs, .prettierrc)
- [ ] T005 [P] Create initial project entry files: src/main.tsx, src/App.tsx, index.html (paths: src/main.tsx, src/App.tsx, index.html)
- [ ] T006 Setup Vitest config and test runner: vitest.config.ts and tests/ directory (paths: vitest.config.ts, tests/)
- [ ] T007 [P] Create CI test script placeholders in package.json (scripts: dev, build, test:unit, test:e2e)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T008 Create TypeScript types for domain entities: src/types/video.ts and src/types/playlist.ts
- [ ] T009 Implement persistence abstraction (localStorage + optional IndexedDB wrapper) at src/lib/persistence.ts
- [ ] T010 [P] Create Zustand store skeleton at src/state/store.ts with shape for playlists, videos, and watch records
- [ ] T011 Implement scoring service (forgetting-curve heuristic) at src/services/scoring.ts and add unit test fixture tests in tests/unit/scoring.test.ts
- [ ] T012 [P] Create services/helpers for parsing/validating YouTube URLs at src/services/youtube.ts
- [ ] T013 Create UI layout and shell components: src/components/Layout.tsx, src/components/Header.tsx, src/components/Footer.tsx
- [ ] T014 [P] Add accessibility baseline (skip-link, ARIA landmarks) into src/components/Layout.tsx
- [ ] T015 Create a developer Quickstart and README update at specs/001-spaced-repetition-playlist/quickstart.md (path updated)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Play Videos (Priority: P1) 🎯 MVP

**Goal**: Allow users to add YouTube links to a playlist and play them inside the app with basic controls.

**Independent Test**: Add three valid YouTube links → open player → play each video → verify player loads and shows a seek bar and title.

### Tests (TDD mandatory)
- [ ] T016 [US1] Write unit tests for YouTube URL parsing and validation in tests/unit/youtube.test.ts
- [ ] T017 [US1] Write component tests for AddVideoForm in tests/unit/AddVideoForm.test.tsx

### Implementation
- [ ] T018 [US1] [P] Create AddVideoForm component at src/components/AddVideoForm.tsx and test harness (file path)
- [ ] T019 [US1] Create VideoItem component at src/components/VideoItem.tsx showing title, thumbnail, duration, status (not_watched/in_progress/watched)
- [ ] T020 [US1] Create PlaylistView component at src/components/PlaylistView.tsx that renders ordered videos and supports selecting a video (path: src/components/PlaylistView.tsx)
- [ ] T021 [US1] Implement Player wrapper component at src/components/Player.tsx that can embed a YouTube iframe or native <video> when available and exposes play/seek/pause APIs (file path)
- [ ] T022 [US1] Connect UI to store: wire AddVideoForm → store → PlaylistView and Player via src/state/store.ts updates
- [ ] T023 [US1] Add unit/component tests for PlaylistView and Player behavior in tests/unit/playlist.test.tsx and tests/unit/player.test.tsx
- [ ] T024 [US1] Add e2e smoke test (Playwright scaffold) that covers add → select → play flow (tests/e2e/us1-add-play.spec.ts)

**Checkpoint**: User Story 1 should be functional and independently testable

---

## Phase 4: User Story 2 - Persistent Progress & Resume (Priority: P1)

**Goal**: Persist per-video watch progress and resume playback from last saved position after closing/reopening.

**Independent Test**: Play for 45 seconds → close app → reopen → resume within 2s of saved timestamp.

### Tests (TDD mandatory)
- [ ] T025 [US2] Add unit tests for persistence layer APIs in tests/unit/persistence.test.ts
- [ ] T026 [US2] Add component-level tests for Player resume behavior in tests/unit/player-resume.test.tsx

### Implementation
- [ ] T027 [US2] [P] Implement watch progress save hook in src/hooks/useWatchProgress.ts that saves currentTime periodically and on pause to src/lib/persistence.ts
- [ ] T028 [US2] Implement resume logic inside src/components/Player.tsx to seek to saved position on load (file path)
- [ ] T029 [US2] Implement UI status updates and last-watched timestamps in src/state/store.ts and ensure persistence keys are written to localStorage (file paths: src/state/store.ts, src/lib/persistence.ts)
- [ ] T030 [US2] Add integration test (Playwright scaffold) validating the resume flow end-to-end (tests/e2e/us2-resume.spec.ts)

**Checkpoint**: Resume behavior should be testable and persistent per-device

---

## Phase 5: User Story 3 - Spaced-Repetition Ordering & Playlist Management (Priority: P2)

**Goal**: Order videos by forgetting-curve-inspired priority and allow users to remove videos.

**Independent Test**: Given videos with varied last-watched timestamps → ordering algorithm places least-recently-watched videos first.

### Tests (TDD mandatory)
- [ ] T031 [US3] Unit tests for scoring/ordering logic and fixtures in tests/unit/scoring-fixtures.test.ts
- [ ] T032 [US3] Component test for PlaylistView ordering behavior in tests/unit/playlist-ordering.test.tsx

### Implementation
- [ ] T033 [US3] Implement ordering UI control and default ordering mode in src/components/PlaylistView.tsx (path)
- [ ] T034 [US3] Implement remove-video action and confirmation modal at src/components/RemoveConfirm.tsx and connect to store (paths)
- [ ] T035 [US3] Ensure removal also cleans up persisted watch record in src/lib/persistence.ts (path)
- [ ] T036 [US3] Add e2e test (Playwright scaffold) for add → simulate watches → reorder by priority → remove video and verify persistence and UI update (tests/e2e/us3-order-remove.spec.ts)

**Checkpoint**: Ordering and removal fully testable and independent

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T037 [P] Update documentation and quickstart: specs/001-spaced-repetition-playlist/quickstart.md and README.md
- [ ] T038 [P] Accessibility audit: run axe-core and fix critical issues; document results in docs/accessibility-manual-checklist.md
- [ ] T039 [P] Performance checks: add simple bundle-size check and resume-latency harness placeholder under tests/perf and report generation in reports/
- [ ] T040 [P] Add CI workflow that runs lint → unit tests → vitest snapshots → optional e2e on demand (paths: .github/workflows/ci.yml)
- [ ] T041 [P] Final UI polish and cross-browser responsive checks (desktop + mobile) in src/styles and component tweaks
- [ ] T042 [P] Create a migration/rollback note in docs/ for persistence schema changes (docs/migrations.md)

--- Observability, Measurement & Security Tasks (Constitutional coverage) ---

- [ ] T043 [P] Implement client-side observability: add a small structured logging helper (src/lib/logging.ts), wire error/context emission from Player and persistence modules, and document the log schema in docs/observability.md.
- [ ] T044 [P] Measurement harness execution: create tests/perf/run-harness.ts that runs the resume-latency and first-play harness (N/M runs) and emits JSON reports to reports/{resume-latency,first-play}/<timestamp>-report.json; add a script npm run perf:report to run and collect artifacts.
- [ ] T045 [P] Release & changelog: add a release script and changelog generation task (scripts/release.md) that documents semantic versioning policy and includes migration notes for persistence schema changes (docs/migrations.md).
- [ ] T046 [P] Metadata fetch + fallback: implement src/services/metadata.ts to attempt oEmbed/YouTube Data API metadata retrieval with graceful fallback to user-supplied metadata; include unit tests and error handling tests.
- [ ] T047 [P] Security review & input validation tests: perform a brief threat-model review and add tests that assert sanitization/validation of input URLs, and that persisted data does not contain PII; document privacy considerations in docs/privacy.md.

---

## Dependencies & Execution Order

### Phase Dependencies
- Setup (Phase 1): complete first (T001..T007)
- Foundational (Phase 2): depends on Setup completion (T008..T015)
- User Stories (Phase 3+): each user story depends on Foundational phase completion but are independently testable after that

### User Story Dependencies
- US1 (P1): can start after Foundational phase complete
- US2 (P1): can start after Foundational phase complete; depends on persistence abstraction (T009)
- US3 (P2): can start after Foundational phase complete; depends on scoring service (T011)

### Parallel Opportunities
- T002, T003, T006, T011, T014, T022 (file-scoped tasks) can run in parallel where they touch different files
- Unit tests for different modules (scoring, persistence, components) can run in parallel

---

## Parallel Example: User Story 1

- Launch component tests and unit tests for US1 in parallel:
  - Task: "T016 [US1] Write unit tests for YouTube URL parsing" and "T017 [US1] Write component tests for AddVideoForm" can run in parallel
- Implement AddVideoForm and VideoItem components concurrently since they are different files:
  - Task: "T018 [US1] Create AddVideoForm component" and "T019 [US1] Create VideoItem component" (both [P])

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (T001..T007)
2. Complete Phase 2: Foundational (T008..T015)
3. Complete Phase 3 (US1) tasks (T016..T024)
4. Validate US1 via unit/component tests and an e2e smoke test
5. Deploy/demo if ready

### Incremental Delivery
1. After MVP (US1), implement US2 (resume) then US3 (ordering)
2. Each story must be independently testable and delivered with tests and docs

---

## Summary & Report

- Generated tasks file: specs/001-spaced-repetition-playlist/tasks.md
- Total tasks: 42
- Tasks per user story: US1: 9 tasks (T016..T024), US2: 6 tasks (T025..T030), US3: 6 tasks (T031..T036), Setup+Foundational+Polish: 21 tasks (T001..T015, T037..T042)
- Parallel opportunities: many (see "Parallel Opportunities" section) — setup/dependency tasks that touch different files are marked [P]
- Independent test criteria: each story includes tests and acceptance criteria as specified in the spec
- Suggested MVP scope: User Story 1 (Create and Play Videos)

**Format validation**: All tasks follow the required checklist format (- [ ] T### [P?] [US?] Description with file path).  


