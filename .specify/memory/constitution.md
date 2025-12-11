<!--
Sync Impact Report
- Version change: unspecified → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] (placeholder) → Code Quality & Maintainability
  - [PRINCIPLE_2_NAME] (placeholder) → Testing Standards (Test-First, TDD)
  - [PRINCIPLE_3_NAME] (placeholder) → User Experience Consistency
  - [PRINCIPLE_4_NAME] (placeholder) → Performance & Resource Requirements
  - [PRINCIPLE_5_NAME] (placeholder) → Observability & Release Versioning
- Added sections: none (filled existing placeholders)
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ⚠ .specify/templates/commands/ (directory missing — manual review if present)
  - ⚠ docs/quickstart.md (file missing — review references to performance/quickstart)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Ratification date unknown; insert official adoption date.
  - TODO: Verify commands/ directory templates for agent-specific names and update to generic guidance.
-->

# LoopTubeList Constitution

## Core Principles

### Code Quality & Maintainability
All code MUST be written to be readable, reviewable, and maintainable. Requirements:
- Code MUST follow the repository style guide and pass automated linters and formatters before merge.
- Modules MUST have clear single responsibilities, minimal public surface area, and include documentation for public APIs.
- Complexity increases MUST be justified in PR descriptions and recorded in the associated spec/plan.
Rationale: Maintainable code reduces onboarding time, prevents regressions, and lowers long-term cost.

### Testing Standards (Test-First, TDD)
Tests are mandatory and MUST be authored before implementation for all new features and bug fixes. Requirements:
- Unit tests MUST cover core logic with a target coverage where applicable, and be fast/local-executable.
- Integration and contract tests MUST validate interactions between components and external systems.
- Performance and regression tests MUST be included when changes affect performance-sensitive codepaths.
- Tests MUST fail first (red) then be implemented (green) and followed by refactoring; CI MUST run tests on every PR.
Rationale: Test-first practice enforces design for testability, prevents regressions, and documents intended behavior.

### User Experience Consistency
User-facing behavior and APIs MUST be consistent and predictable across the product surface. Requirements:
- UX acceptance criteria (including error messages, validation, and accessibility considerations) MUST be included in specs and verified by tests or QA signoff.
- Public APIs and CLI behavior MUST be backward compatible within a MINOR release; breaking changes MUST follow versioning and migration guidance in Governance.
- Documentation and quickstart examples MUST reflect the intended user flows and be kept in sync with code.
Rationale: Consistent UX reduces user confusion, support burden, and enables safer evolution of public interfaces.

### Performance & Resource Requirements
Performance objectives MUST be stated in plans/specs and validated by measurements. Requirements:
- Features that affect latency, throughput, memory, or battery MUST include measurable targets (p95 latency, throughput, memory footprint) in their spec.
- Changes that could regress measured goals MUST include performance tests in CI or a validation plan to run prior to merge to protected branches.
- Resource budgeting (e.g., memory, CPU, bundle size) MUST be part of acceptance criteria for relevant features.
Rationale: Explicit performance expectations make trade-offs visible and prevent inadvertent regressions in user experience.

### Observability & Release Versioning
Systems MUST emit structured telemetry and be versioned to enable debugging and safe rollouts. Requirements:
- Code MUST include structured logs, error context, and health signals appropriate to the runtime (server, client, CLI).
- Releases MUST follow semantic versioning for public interfaces and include changelogs describing breaking changes and migration steps.
- Alerts and dashboards for critical paths SHOULD be proposed when feature scope or risk warrants operational visibility.
Rationale: Observability accelerates incident resolution and semantic versioning communicates risk to integrators.

## Additional Constraints: Security, Accessibility, Compliance
- Security requirements (authentication, authorization, data handling) MUST be stated in the spec and validated in code review and tests.
- Accessibility requirements for user-facing components MUST be considered and documented in UX acceptance criteria.
- Any legal or compliance constraints (e.g., data retention, encryption at rest) MUST be captured in the plan and followed through implementation.

## Development Workflow & Quality Gates
- All changes MUST be submitted as PRs with linked plan/spec/tasks and a clear description of intent, scope, and rollback strategy.
- CI gates: lint → unit tests → integration/contract tests → performance checks (if applicable) → manual QA (if required).
- Code reviews MUST validate adherence to Core Principles, cite relevant tests/benchmarks, and require at least one approving reviewer.

## Governance
Amendments to this constitution require a documented proposal, a migration plan for affected artifacts, and approval from the maintainers group. Versioning and amendment rules:
- Patch: Non-substantive wording, typo fixes, clarifications (e.g., grammar) — increment PATCH.
- Minor: Adds new principle or materially expands guidance without removing existing guarantees — increment MINOR.
- Major: Removes or redefines principles in a backward-incompatible way — increment MAJOR.
- RATIFICATION_DATE is the original adoption date (TODO if unknown). LAST_AMENDED_DATE is updated to the date of any change.
- Compliance: Every PR touching implementation or templates referenced by this constitution MUST include a short “Constitution Check” section describing how the change complies.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): insert official adoption date | **Last Amended**: 2025-12-11

