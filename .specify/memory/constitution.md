# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

```markdown
# Sync Impact Report
<!--
Version change: TEMPLATE -> 0.1.0
Modified principles:
- [PRINCIPLE_1_NAME] -> Accessibility & User-First
- [PRINCIPLE_2_NAME] -> Test-First Quality (NON-NEGOTIABLE)
- [PRINCIPLE_3_NAME] -> Minimal Dependencies & Simplicity
- [PRINCIPLE_4_NAME] -> Observability & Error Handling
- [PRINCIPLE_5_NAME] -> Versioning, Releases & Licensing
Added sections:
- Security & Privacy Requirements
- Development Workflow & Quality Gates
Removed sections:
- None
Templates reviewed:
- .specify/templates/plan-template.md: ✅ reviewed (no change required)
- .specify/templates/spec-template.md: ✅ reviewed (no change required)
- .specify/templates/tasks-template.md: ✅ reviewed (no change required)
Follow-up TODOs:
- TODO(RATIFICATION_DATE): original adoption date unknown — please supply ISO date (YYYY-MM-DD)
-->

# LoopTubeList Constitution

## Core Principles

### Accessibility & User-First
The project MUST prioritize accessible, usable experiences for all users. All public UI components and pages
MUST follow semantic HTML, provide keyboard navigation, proper ARIA roles where necessary, and include automated
accessibility tests as part of the CI pipeline (see `tests/a11y/`). Rationale: accessibility is fundamental to the
product's user value and is already validated by existing a11y tests in the repository.

### Test-First Quality (NON-NEGOTIABLE)
All new features and fixes MUST include automated tests (unit/integration/e2e as appropriate). Tests SHOULD be
authored before implementation (TDD) when feasible, and every Pull Request MUST pass the test suite. The project
SHOULD maintain a baseline coverage target and require failing CI for regressions that break critical flows.

### Minimal Dependencies & Simplicity
Favor native browser APIs and small, well-audited dependencies. New dependencies MUST be justified in the PR and
reviewed for size, maintenance, and licensing. Design choices MUST follow YAGNI and KISS principles: prefer simple,
maintainable implementations over complex abstractions unless clear value is demonstrated.

### Observability & Error Handling
Errors and exceptional states MUST be explicit and actionable: surface clear error messages, include structured logs
during development, and provide graceful fallbacks in the UI. Production telemetry is optional; if added, it MUST be
documented and respect user privacy (see Security & Privacy Requirements).

### Versioning, Releases & Licensing
Public interfaces (npm packages, published APIs) MUST follow semantic versioning (MAJOR.MINOR.PATCH). Each release
MUST include a changelog entry describing breaking changes and migration guidance. The project LICENSE file in the
repo root MUST be present and kept up to date; contributions are accepted via pull requests following the workflow
defined below.

## Security & Privacy Requirements
The project MUST not collect or transmit user-identifiable data without explicit consent and a documented purpose.
All external inputs (URLs, IDs, query params) MUST be validated and sanitized to avoid XSS and injection risks. The
dependency tree MUST be periodically scanned for vulnerabilities and any high/critical findings addressed or mitigated
before release.

## Development Workflow & Quality Gates
- Pull Requests: All code changes MUST be submitted as PRs against `main` (feature branches prefixed `feat/` or `fix/`).
- Reviews: At least one approving review from a project maintainer or a code owner is REQUIRED before merge.
- CI: PRs MUST pass linting, unit tests, and a11y checks. Blocking checks are configured in the repository's CI.
- Commits: Use conventional commits where possible (e.g., `feat:`, `fix:`, `docs:`) to simplify changelog generation.
- Releases: Tag releases with semantic versions and include changelog and migration notes for breaking changes.

## Governance
Amendments to this constitution MUST be made via a documented Pull Request that: (1) updates this file, (2) provides
an explicit rationale and migration plan for any breaking governance changes, and (3) is approved by repository
maintainers or those designated in `CODEOWNERS`. Minor editorial fixes (typos, clarifications) may be merged after a
single maintainer review. Major governance changes (redefining principles or removing sections) REQUIRE consensus
from core maintainers and a clear migration path for affected processes.

Compliance Review Expectations:
- Every release cycle SHOULD include a brief constitution compliance check (examples: ensure CI still enforces tests,
  a11y checks pass, dependency policy followed).

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2025-12-10

```
