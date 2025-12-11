# data-model.md

Entities:

1) Site Build Artifact
- Fields:
  - path: string (relative path to artifact root, e.g., /dist)
  - commit: string (git SHA of source)
  - built_at: timestamp
  - size_bytes: integer
  - files_count: integer
- Relationships: produced_by -> CI Build (external)
- Validation:
  - path must exist and contain index.html
  - commit must be a 40-character SHA

2) Deployment Record
- Fields:
  - id: uuid or integer
  - commit: string
  - source: string ("ci" | "manual")
  - status: string (pending|success|failure)
  - published_at: timestamp|null
  - logs_url: string (CI run URL or deployment logs)
- Validation:
  - status must be one of the allowed values
  - If status==success, published_at MUST be present

State transitions:
- pending -> success | failure
- success -> (archived) (no rollback by default; rollback is a new deployment)

Notes: These are lightweight, audit-focused records surfaced via CI logs and optional telemetry; they are not required to be persisted in-app for this feature but should be recorded in CI run metadata and build artifacts for traceability.
