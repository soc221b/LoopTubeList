---
description: "Generated task list for feature implementation: Play YouTube Playlist via Iframe"
---

# Tasks: Play YouTube Playlist via Iframe

**Feature Dir (absolute)**: /Users/yung-yuanchang/Documents/self/LoopTubeList/specs/001-add-playlist-iframe
**Input**: Design documents from `/specs/001-add-playlist-iframe/` (spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic developer tooling. These tasks prepare the repo for implementation work.

- [ ] T001 Create Next.js App at repository root by running `npx create-next-app@latest . --app --tailwind --eslint --ts --use-npm` (repo root)
- [ ] T002 [P] Create `biome.toml` and add `@biomejs/biome` config (file: `/biome.toml`)
- [ ] T003 [P] Verify Tailwind files exist and create `styles/globals.css` if missing (file: `/styles/globals.css`)
- [ ] T004 [P] Add testing config and deps: create `jest.config.cjs` and add testing deps in `package.json` (`jest`, `ts-jest`, `@testing-library/react`) (file: `/jest.config.cjs`)
- [ ] T005 [P] Add ESLint a11y plugin and config: update or create `.eslintrc.json` including `eslint-plugin-jsx-a11y` (file: `/.eslintrc.json`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and components that MUST exist before user stories are implemented.

- [ ] T006 [P] Create playlist parsing utility `utils/parsePlaylistId.ts` that extracts and validates YouTube playlist IDs (file: `/utils/parsePlaylistId.ts`)
- [ ] T007 [P] Add unit tests for parsing utility `tests/utils/parsePlaylistId.test.ts` (file: `/tests/utils/parsePlaylistId.test.ts`)
- [ ] T008 [P] Create `components/PlaylistPlayer.tsx` (client component) which renders a sanitized YouTube iframe and exposes props: `playlistId`, `onError` (file: `/components/PlaylistPlayer.tsx`)
- [ ] T009 Create integration page `app/page.tsx` that provides the playlist input form and mounts `PlaylistPlayer` (file: `/app/page.tsx`)
- [ ] T010 [P] Add accessibility scaffolding: update `specs/001-add-playlist-iframe/quickstart.md` with manual A11y smoke-test steps and ensure `aria-live`/`role="alert"` patterns are documented (file: `/specs/001-add-playlist-iframe/quickstart.md`)

**Checkpoint**: After Phase 2, components and utilities exist and can be wired into story-specific UI.

---

## Phase 3: User Story 1 - Play pasted YouTube playlist (Priority: P1) 🎯 MVP

**Goal**: Allow a visitor to paste a YouTube playlist URL and play it in an embedded iframe on the same page.

**Independent Test**: Paste a known valid YouTube playlist URL into the input at `/app/page.tsx`, click Play, and verify the `iframe` `src` contains the expected embed URL (`https://www.youtube.com/embed/videoseries?list=<PLAYLIST_ID>`) and the player is visible.

### Tests (UNIT/INTEGRATION)

- [ ] T011 [P] [US1] Create integration test `tests/integration/playback.test.tsx` that simulates paste → submit and asserts iframe `src` and visibility (file: `/tests/integration/playback.test.tsx`)

### Implementation

- [ ] T012 [US1] Create `components/PlaylistInput.tsx` (client) with labeled input, Paste handling, and `Play` button (file: `/components/PlaylistInput.tsx`)
- [ ] T013 [P] [US1] Wire `components/PlaylistInput.tsx` and `components/PlaylistPlayer.tsx` in `app/page.tsx` to parse input using `utils/parsePlaylistId.ts` and set the embed state (file: `/app/page.tsx`)
- [ ] T014 [US1] Implement user-facing error UI in `components/ErrorMessage.tsx` and render error messages when parsing or embedding fails (file: `/components/ErrorMessage.tsx`)
- [ ] T015 [US1] Add focus management: when validation fails, move focus to the input using a ref (implementation in `/components/PlaylistInput.tsx`)

**Checkpoint**: US1 is independently testable via `tests/integration/playback.test.tsx` and manual verification at `/app/page.tsx`.

---

## Phase 4: User Story 2 - Handle invalid or non-playlist links (Priority: P2)

**Goal**: Validate inputs and show clear, actionable error messages for invalid, single-video, private/un-embeddable, or malformed playlist links.

**Independent Test**: Submit invalid inputs and verify the error message appears, the input is focused, and no `iframe` is rendered.

### Tests

- [ ] T016 [P] [US2] Create unit tests `tests/validation/invalid-inputs.test.ts` covering malformed URLs, single-video URLs, empty string, and whitespace-only input (file: `/tests/validation/invalid-inputs.test.ts`)

### Implementation

- [ ] T017 [US2] Update `utils/parsePlaylistId.ts` to return typed error variants (`InvalidFormat`, `NoPlaylistId`, `PrivateOrUnembeddable`) and ensure callers handle each case (file: `/utils/parsePlaylistId.ts`)
- [ ] T018 [US2] Implement embed failure detection in `components/PlaylistPlayer.tsx` by listening to iframe load/error events and invoking `onError` with a specific code (file: `/components/PlaylistPlayer.tsx`)
- [ ] T019 [US2] Display contextual messages in `components/ErrorMessage.tsx` for each error variant and ensure messages are announced via `aria-live` (file: `/components/ErrorMessage.tsx`)

**Checkpoint**: US2 tests and UI must ensure invalid inputs never render a playable iframe and always show a clear error.

---

## Phase 5: User Story 3 - Mobile and responsive playback (Priority: P3)

**Goal**: Ensure the input and embedded player layout are responsive and maintain aspect ratio across viewport sizes.

**Independent Test**: On narrow viewports, play a playlist and verify the player fits horizontally and controls are usable without horizontal scrolling.

### Tests

- [ ] T020 [P] [US3] Create responsive integration test `tests/responsive/player.responsive.test.tsx` that renders `app/page.tsx` in different viewport sizes and asserts layout (file: `/tests/responsive/player.responsive.test.tsx`)

### Implementation

- [ ] T021 [US3] Apply responsive styles in `components/PlaylistPlayer.tsx` and `styles/globals.css` using Tailwind utilities to maintain 16:9 aspect ratio and fluid width (files: `/components/PlaylistPlayer.tsx`, `/styles/globals.css`)
- [ ] T022 [US3] Add keyboard and focus accessibility improvements for mobile and small screens in `components/PlaylistInput.tsx` (file: `/components/PlaylistInput.tsx`)

**Checkpoint**: US3 should pass responsive tests and manual checks on mobile devices.

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T023 [P] Update `specs/001-add-playlist-iframe/quickstart.md` with exact bootstrap and verification commands (file: `/specs/001-add-playlist-iframe/quickstart.md`)
- [ ] T024 [P] Add CI workflow `.github/workflows/ci.yml` to run `npm ci`, `@biomejs/biome check`, and `npm test` (file: `/.github/workflows/ci.yml`)
- [ ] T025 [P] Documentation: Add developer notes and A11y checklist to `specs/001-add-playlist-iframe/research.md` (file: `/specs/001-add-playlist-iframe/research.md`)
- [ ] T026 Security: Audit input handling to ensure no HTML injection - add a checklist entry in `specs/001-add-playlist-iframe/checklists/requirements.md` (file: `/specs/001-add-playlist-iframe/checklists/requirements.md`)
- [ ] T027 [P] Add `web-vitals` instrumentation to capture LCP/CLS/INP and add a small reporting hook (file: `/utils/webVitals.ts`, add to `app/layout.tsx` or `app/page.tsx`) (coverage for SC-001)
- [ ] T028 [P] Integrate automated accessibility checks into CI: add `jest-axe` tests and/or `lighthouse-ci` configuration and CI job (file: `/.github/workflows/ci.yml`, tests: `/tests/a11y/*.test.tsx`)
- [ ] T029 [P] Implement IFrame Player API failure detection with an 8s timeout fallback and map errors to user messages (file: `/components/PlaylistPlayer.tsx`, `/tests/integration/playback.test.tsx`)

---

## Dependencies & Execution Order

- Setup (Phase 1) must complete before Foundational (Phase 2).
- Foundational tasks (Phase 2) must complete before any User Story phases.
- User Stories should be implemented in priority order (US1 → US2 → US3) but may be worked on in parallel after Phase 2 completes.

### Story Completion Order

- [US1] → [US2] → [US3]

### Parallel Opportunities

- Tasks marked `[P]` can be executed in parallel (different files, no blocking dependencies). Typical parallel tasks: tooling config (`T002`, `T003`, `T004`, `T005`), unit tests (`T007`, `T016`), responsive tests (`T020`), and CI setup (`T024`).

---

## Parallel Execution Examples

- Example: While one engineer runs `T001` to scaffold Next.js, others can prepare `T006` (`/utils/parsePlaylistId.ts`), `T008` (`/components/PlaylistPlayer.tsx`) and `T002` (`/biome.toml`) in parallel and open PRs that are merged after `T001` completes.

---

## Implementation Strategy

- **MVP First**: Implement Phase 1 → Phase 2 → Phase 3 (US1). Stop and validate US1 independently (integration test `T011`) before working on US2/US3.
- **Incremental Delivery**: After US1 is validated, implement US2 then US3, running tests and manual A11y checks at each checkpoint.
- **Testing**: Prefer unit tests for parsing (`T007`) and integration tests for UI flows (`T011`, `T016`, `T020`). Keep tests fast and focused.

---

## Report Summary

- **Generated file**: `/Users/yung-yuanchang/Documents/self/LoopTubeList/specs/001-add-playlist-iframe/tasks.md`
- **Total tasks**: 26
- **Tasks per user story**:
  - US1: 5 tasks (T011–T015)
  - US2: 4 tasks (T016–T019)
  - US3: 3 tasks (T020–T022)
- **Parallel opportunities identified**: many tasks marked `[P]` (Tooling, unit tests, CI, docs)
- **Independent test criteria**: each story includes an "Independent Test" entry above its implementation tasks ensuring the story is independently verifiable
- **Suggested MVP scope**: Complete Phase 1 + Phase 2 + Phase 3 (US1) only (tasks T001–T015)
- **Format validation**: All tasks follow the checklist format `- [ ] T### [P?] [US?] Description with file path`
