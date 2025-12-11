# Migrations & Persistence Schema

This document records migration notes for the local persistence schema.

Current approach: client-side per-device persistence in localStorage keys under `looptubelist:watch:{videoId}`.

When changing schema:
- Increment a local schema version key `looptubelist:schema_version` and provide an on-load migration that transforms existing keys.
- Keep migrations idempotent and test them against fixtures.

Rollback: Keep backups of localStorage exports when running automated migrations during development.
