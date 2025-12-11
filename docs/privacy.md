# Privacy & Data Handling

This project stores per-device watch progress in localStorage. Privacy considerations:

- No PII is collected or stored by default.
- Watch records contain: videoId, last_position_seconds, last_watched_at.
- Do not store user identifiers or tokens in localStorage.
- When adding telemetry, avoid logging or persisting PII; redact sensitive fields.
- Document any external API calls (e.g., metadata fetch) and their data handling in this file.
