# Observability

This project uses a small structured logging helper (src/lib/logging.ts). Logs are emitted as single-line JSON objects with the following schema:

- timestamp: ISO 8601 timestamp
- level: debug | info | warn | error
- message: human-readable message
- meta: optional object with additional context

Usage examples:

- logger.info('video.play', { videoId })
- logger.error('persistence.save_failed', { err })

Store logs centrally or stream to a collector in production; avoid logging PII. See docs/privacy.md for privacy considerations.
