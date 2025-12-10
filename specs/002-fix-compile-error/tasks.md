---
description: "Tasks for fixing the Next.js dev server compile error"
---

# Tasks: Fix Dev Server Compile Error

**Input**: Design documents from `/specs/002-fix-compile-error/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `quickstart.md`

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create `.nvmrc` specifying Node 18 at `./.nvmrc`
- [X] T002 Add local smoke script `scripts/dev-smoke.sh` that runs `npm ci && npm run build` (file: `./scripts/dev-smoke.sh`)
- [X] T003 Add CI smoke workflow `./.github/workflows/ci-smoke.yml` to run `npm ci` and `npm run build` on PRs

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 [P] Update `README.md` with required Node version and local dev instructions (file: `./README.md`)
- [X] T005 [P] Add `.env.example` and document required environment variables if any (file: `./.env.example`)
- [X] T006 [P] Ensure `package.json` scripts include `dev`, `build`, and `start` and that `dev` maps to `next dev` (file: `./package.json`)

**Checkpoint**: Foundation ready — reproduction and diagnosis tasks may now run

---

## Phase 3: User Story 1 - Reproduce & Fix Compile Error (Priority: P1) 🎯 MVP

**Goal**: Reproduce the `Failed to compile` error, identify the root cause, implement a minimal fix, and add a CI smoke check to prevent regressions.

**Independent Test**: Run `npm ci` then `npm run dev` locally (or `./scripts/dev-smoke.sh`) and confirm there is no `Failed to compile` message. Documentation and logs are stored in `specs/002-fix-compile-error/`.

- [X] T007 [US1] Reproduce the compile failure and save full logs to `specs/002-fix-compile-error/dev-compile.log`
- [X] T008 [US1] Analyze `specs/002-fix-compile-error/dev-compile.log` and write a root-cause summary in `specs/002-fix-compile-error/research.md` under a new "Root Cause" subsection
- [X] T009 [US1] Implement the minimal fix in the affected file(s) (apply changes to the file(s) listed in `specs/002-fix-compile-error/research.md` — e.g., `components/PlaylistPlayer.tsx`, `next.config.mjs`, or `postcss.config.mjs`) and commit the changes
- [X] T010 [US1] Add or update tests to prevent regression: create `tests/smoke/dev-start.test.ts` (or add a CI smoke job) that runs `npm run build` and asserts exit code 0 (file: `tests/smoke/dev-start.test.ts`)
- [X] T011 [US1] Update CI workflow `./.github/workflows/ci-smoke.yml` to run on PRs and verify `npm ci && npm run build` succeeds
- [X] T012 [US1] Create a PR with the fix, include `specs/002-fix-compile-error/dev-compile.log` and `specs/002-fix-compile-error/research.md` root-cause notes, and request reviewers to verify local startup
- [ ] T013 [US1] Address review feedback, update implementation and tests as required, and merge the PR

**Checkpoint**: User Story 1 should now be resolved and independently testable

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T014 [P] Update `./README.md` quickstart section with the reproduction and verification steps (file: `./README.md`)
- [X] T015 [P] Add `.nvmrc` (if not already added in T001) and document Node version in CI matrix (file: `./.nvmrc` and `./.github/workflows/ci-smoke.yml`)
- [X] T016 [P] Remove any temporary debug files created during investigation (e.g., `specs/002-fix-compile-error/dev-compile.log` or move to `specs/002-fix-compile-error/artifacts/`)
- [X] T017 [P] Add changelog entry in `CHANGELOG.md` documenting the fix (file: `./CHANGELOG.md`)

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: T001 → T002 → T003 (can be done in parallel where marked [P])
- **Phase 2 (Foundational)**: Depends on Phase 1 completion (T004-T006) — foundational tasks marked [P] can run in parallel
- **Phase 3 (User Story 1)**: Blocks on Foundational completion; within phase: T007 → T008 → T009 → T010 → T011 → T012 → T013
- **Phase 4 (Polish)**: Can run after User Story completion; many tasks marked [P] and can be parallelized

### User Story Dependencies
- **US1 (P1)**: Depends on Foundational phase. All US1 tasks must be completed to close the story.

## Parallel Execution Examples

- While Foundation tasks run, another engineer can prepare the CI workflow and smoke script:
  - `T002` and `T003` can run in parallel
- After reproduction (T007) and root-cause analysis (T008), the implementation (T009) is generally single-threaded to avoid conflicts, but writing tests (T010) and CI updates (T011) can be done in parallel by another engineer

## Implementation Strategy

### MVP First

1. Complete Phase 1: Add `.nvmrc`, create `scripts/dev-smoke.sh`, and scaffold `./.github/workflows/ci-smoke.yml` (T001-T003)
2. Complete Phase 2: Update `README.md`, ensure `package.json` scripts are correct (T004-T006)
3. Reproduce the failure (T007), classify root cause (T008), implement minimal fix (T009), add smoke test (T010), update CI (T011), and open PR (T012)
4. Validate locally and in CI, address feedback, merge (T013)

### Incremental Delivery

- Deliver a CI smoke check and documentation first so subsequent PRs will be validated automatically
- Then deliver the fix and tests in a single PR

## Files referenced by tasks

- `specs/002-fix-compile-error/spec.md`
- `specs/002-fix-compile-error/research.md`
- `specs/002-fix-compile-error/dev-compile.log`
- `scripts/dev-smoke.sh`
- `./.nvmrc`
- `./.github/workflows/ci-smoke.yml`
- `tests/smoke/dev-start.test.ts`
- `components/PlaylistPlayer.tsx` (potential target)
- `next.config.mjs` (potential target)
- `postcss.config.mjs` (potential target)

---

## Validation

- **Total task count**: 17
- **User story task count (US1)**: 7 (T007-T013)
- **Parallel opportunities**: T002, T003, T004, T005, T006, T014-T017
- **Independent test criteria for US1**: Reproduce `Failed to compile` -> fix -> `npm run dev` starts without error; CI smoke job `npm run build` passes
- **Suggested MVP scope**: Only User Story 1 (T007-T013) plus Phase 1 setup tasks (T001-T003)
- **Format validation**: All tasks follow the checklist format with Task IDs and explicit file paths where applicable
