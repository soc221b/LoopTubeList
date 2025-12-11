---

description: "Generated tasks for feature 002-github-page"
---

# Tasks: 002-github-page

**Input**: Design documents from `/repo/specs/002-github-page/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure required for CI and local deploys

- [X] T001 [P] Add `deploy:local` and `deploy:gh-pages` npm scripts to package.json (file: /repo/package.json)
- [X] T002 [P] Create a small helper script that uses GitHub CLI to deploy `./dist` locally: `scripts/deploy-local.sh` (file: /repo/scripts/deploy-local.sh)
- [X] T003 [P] Add or update repository quickstart documentation referencing local and CI deploy flows (copy/update `/repo/specs/002-github-page/quickstart.md` → `/docs/pages-quickstart.md`) (file: /repo/docs/pages-quickstart.md)
- [X] T001a [P] (Test-First) Add failing unit test skeletons to satisfy constitution: create `/tests/unit/__placeholder__.spec.ts` with a single failing assertion (file: /repo/tests/unit/__placeholder__.spec.ts)
- [X] T001b [P] (Test-First) Add CI test-job stub that runs unit tests and initially fails until implementation: update `.github/workflows/pages.yml` to include a `test` job/stub (file: /repo/.github/workflows/pages.yml)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core CI/Pages infrastructure that MUST be complete before user stories can be implemented

- [X] T004 Create GitHub Actions workflow to build and publish Pages on push to the default branch: add `.github/workflows/pages.yml` with steps: checkout, npm ci, npm run lint, npm run test:unit, npm run build, actions/upload-pages-artifact@v3 (upload `dist/`), actions/deploy-pages@v1 (deploy artifact) (file: /repo/.github/workflows/pages.yml)
- [X] T005 Ensure the workflow runs lint and unit/e2e tests before build (update `/repo/.github/workflows/pages.yml` to include `npm run lint`, `npm run test:unit`, `npm run test:e2e`) (file: /repo/.github/workflows/pages.yml)
- [X] T006 Add a workflow validation step that fails the run if `dist/index.html` is missing after build (update `/repo/.github/workflows/pages.yml`) (file: /repo/.github/workflows/pages.yml)
- [X] T007 Add a simple deployment-record generator that writes deployment metadata (commit SHA, timestamp, artifact size) to `artifacts/deployment-record.json` and upload it as a workflow artifact (create `/repo/scripts/generate-deployment-record.sh` and reference from `/repo/.github/workflows/pages.yml`) (files: /repo/scripts/generate-deployment-record.sh, /repo/.github/workflows/pages.yml)
- [X] T007a Add Actions summary and failure notification: post a concise failure summary to the Actions run summary and optionally open an issue or send a notification via configured webhook when deployment validation fails (update `/repo/.github/workflows/pages.yml`) (file: /repo/.github/workflows/pages.yml)

**Checkpoint**: After Phase 2 the CI must build, validate the site, and publish artifacts for audit.

---

## Phase 3: User Story 1 - Publish on push to default branch (Priority: P1) 🎯 MVP

**Goal**: Automatically publish the built site to GitHub Pages when a commit is pushed to the default branch.

**Independent Test**: Push a trivial change to the default branch and confirm the Actions run completes successfully and the public Pages URL serves the updated page within 15 minutes.

### Implementation for User Story 1

- [ ] T008 [US1] Ensure the Pages workflow trigger includes `on: push: branches: [main]` (or the repo default branch) in `/repo/.github/workflows/pages.yml` (file: /repo/.github/workflows/pages.yml)
- [ ] T009 [US1] Add a workflow step to log the published Pages URL and mark the deployment status in the Actions summary (update `/repo/.github/workflows/pages.yml`) (file: /repo/.github/workflows/pages.yml)
- [ ] T010 [P] [US1] Add a smoke end-to-end test that verifies the published URL returns a 200 and contains expected text; put test at `/repo/tests/e2e/pages-smoke.spec.ts` (file: /repo/tests/e2e/pages-smoke.spec.ts)
- [ ] T011 [US1] Add CI job step to run the smoke test only after deployment (update `/repo/.github/workflows/pages.yml`) (file: /repo/.github/workflows/pages.yml)
- [ ] T012 [US1] Add brief verification instructions to `/repo/specs/002-github-page/quickstart.md` describing how to validate a pushed change updated the Pages site (file: /repo/specs/002-github-page/quickstart.md)

**Checkpoint**: US1 should be verifiable by a push to the default branch and the e2e smoke test.

---

## Phase 4: User Story 2 - Manual/local deployment (Priority: P2)

**Goal**: Provide a documented, easy command for developers to publish the built site from their machine.

**Independent Test**: Run the documented deploy command locally after building and confirm the public Pages site reflects the local build.

### Implementation for User Story 2

- [X] T013 [US2] Add `deploy:local` npm script using GitHub CLI in `/repo/package.json` (e.g., `gh pages deploy ./dist`) (file: /repo/package.json)
- [X] T014 [US2] Add fallback npm script `deploy:gh-pages` using the `gh-pages` package and add `gh-pages` as a devDependency in `/repo/package.json` (file: /repo/package.json)
- [X] T015 [US2] Create helper script `/repo/scripts/deploy-local.sh` that runs pre-deploy checks (ensures `dist/index.html` exists) and invokes `gh pages deploy ./dist` (file: /repo/scripts/deploy-local.sh)
- [ ] T016 [US2] Add a short section to `/repo/README.md` that documents the local deploy steps and references `/repo/specs/002-github-page/quickstart.md` (file: /repo/README.md)

**Checkpoint**: US2 is complete when a developer can run `npm run build` then `npm run deploy:local` (or `npm run deploy:gh-pages`) and see the site updated.

---

## Phase 5: User Story 3 - Custom domain support (Priority: P3)

**Goal**: Provide guidance and workflow support for publishing the site under a custom domain.

**Independent Test**: Add a `CNAME` file or configure repository Pages with the custom domain per documentation and verify the site resolves for that domain.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Add documentation on custom domain setup and DNS steps in `/repo/docs/custom-domain.md` (file: /repo/docs/custom-domain.md)
- [ ] T018 [US3] Add a note to the quickstart describing where to place `CNAME` so it is included in the `dist/` artifact (update `/repo/specs/002-github-page/quickstart.md`) (file: /repo/specs/002-github-page/quickstart.md)
- [ ] T019 [US3] Ensure the Pages workflow preserves `CNAME` when publishing by keeping CNAME in the uploaded artifact (update `/repo/.github/workflows/pages.yml`) (file: /repo/.github/workflows/pages.yml)

**Checkpoint**: US3 is testable by configuring a custom domain and verifying DNS and Pages settings.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and cross-cutting improvements

- [ ] T020 [P] Update `/repo/specs/002-github-page/tasks.md` with final task run notes and mark completed tasks (file: /repo/specs/002-github-page/tasks.md)
- [ ] T021 [P] Add a lightweight rollback instruction and optional `/repo/scripts/rollback.sh` that describes how to redeploy a previous artifact (file: /repo/scripts/rollback.sh)
- [X] T021a [P] Add rollback automation helper: implement `/repo/scripts/rollback.sh` that can redeploy a previous artifact given an artifact ID or commit SHA and document usage (file: /repo/scripts/rollback.sh)
- [ ] T022 [P] Run quickstart.md validation and update any broken steps (file: /repo/specs/002-github-page/quickstart.md)
- [ ] T023 [P] Add documentation link to `/repo/README.md` pointing to `/docs/pages-quickstart.md` and `/repo/docs/custom-domain.md` (file: /repo/README.md)

---

## Dependencies & Execution Order

- Phase 1 (Setup) tasks T001-T003 can run in parallel where marked [P].
- Phase 2 (Foundational) tasks T004-T007 MUST be completed before any user story tasks (T008+).
- User Story phases (US1 → US2 → US3) should be implemented in priority order for MVP, but after Phase 2 they can run in parallel if team capacity allows.

### Story completion order (dependency graph)

1. Phase 1 (T001-T003) → 2. Phase 2 (T004-T007) → 3. User Story 1 (T008-T012) → 4. User Story 2 (T013-T016) → 5. User Story 3 (T017-T019) → 6. Polish (T020-T023)

---

## Parallel execution examples

- Run package changes, helper script creation, and docs addition in parallel:
  - T001, T002, T003 (all marked [P])
- After foundational tasks complete, run per-story parallel work (e.g., T010 (e2e test) in parallel with T009 modifications to workflow's summary logging because they touch different files)

---

## Implementation Strategy

### MVP First (User Story 1 only)
1. Complete Phase 1 (T001-T003)
2. Complete Phase 2 (T004-T007)
3. Implement User Story 1 (T008-T012) and validate via the independent test
4. Stop and validate the deployed Pages site before adding US2/US3

### Incremental Delivery
- After MVP, implement US2 (T013-T016) then US3 (T017-T019). Use Phase N tasks for documentation/rollback.

---

## Task Summary

- Total tasks: 23
- Tasks per story/phase:
  - Phase 1 (Setup): 3 tasks (T001-T003)
  - Phase 2 (Foundational): 4 tasks (T004-T007)
  - User Story 1 (US1): 5 tasks (T008-T012)
  - User Story 2 (US2): 4 tasks (T013-T016)
  - User Story 3 (US3): 3 tasks (T017-T019)
  - Polish: 4 tasks (T020-T023)
- Parallel opportunities: T001, T002, T003, T010, T017, T020-T023 (see [P] markers)

---

## Validation Checklist (format compliance)

- All tasks start with `- [ ]` and include TaskID (T001...), optional `[P]` when parallelizable, and `[USn]` for story tasks.
- Each task description ends with an explicit absolute file path.


