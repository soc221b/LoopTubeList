# Test Plan: Spaced Repetition Playlist

Purpose: Provide automated and manual tests to validate Success Criteria (SC-001..SC-005) and the "Feature meets measurable outcomes" checklist item.

Overview:
- Automated unit tests: verify forgetting-curve scoring and ordering logic.
- Automated E2E tests (Playwright): validate add/play/remove flows and resume behavior under simulated network conditions.
- Performance harness: measure resume latency for N runs and produce a JSON report.
- Accessibility checks: run axe-core audits and a small manual checklist.

Test mapping (per Success Criterion):

SC-001 (Resume latency)
- What to test: Time from user pressing play to media playback actually reaching the stored timestamp.
- Automation: Playwright script that loads the app, starts playback to a known timestamp, stores progress, then reloads and measures time-to-resume over N=100 runs.
- Pass threshold: >=95% of runs show resume time <= 2s.
- Example command: npm run test:e2e -- --grep resume-latency
- Report: JSON with total_runs, runs_within_threshold, p95_latency_seconds, pass:boolean

SC-002 (Time-to-first-play on first visit)
- What to test: Time from first visit to playback start under mobile 4G emulation.
- Automation: Playwright with network emulation (slow 4G), perform first-visit flow for M=50 runs, measure time-to-first-play.
- Pass threshold: >=90% runs <= 30s
- Command: npm run test:e2e -- --grep first-play

SC-003 (Ordering correctness)
- What to test: Deterministic unit tests for scoring function using fixed watch histories, fixture-driven unit tests.
- Automation: Jest unit tests covering top-3 ordering and monotonicity properties.
- Pass threshold: All unit tests pass
- Command: npm run test:unit

SC-004 (Add/remove immediate UI update)
- What to test: Add several items, remove one, assert playlist UI and storage reflect change immediately.
- Automation: Playwright UI test asserting visible changes and checking localStorage (or other chosen persistence) after removal.
- Pass threshold: UI state and storage reflect removal in under 1s for 95% of test runs.
- Command: npm run test:e2e -- --grep add-remove

SC-005 (Accessibility)
- What to test: Run automated axe-core scan against key pages and perform a manual keyboard/screen-reader smoke test checklist.
- Automation: Playwright + axe integration; report violations as JSON
- Pass threshold: No critical/serious violations; manual checklist passes
- Command: npm run test:e2e -- --grep accessibility

Test artifacts & reporting
- Each test run should emit a JSON report in ./reports/<type>/<timestamp>-report.json with pass/fail and metrics.
- Example report fields for resume-latency: {
  "total_runs":100,
  "runs_within_threshold":96,
  "p95_latency_ms":850,
  "pass":true
}

Environment & setup
- Node 18+ recommended
- Install dev deps: npm ci
- Playwright browsers: npx playwright install --with-deps
- Run tests: npm test, npm run test:unit, npm run test:e2e

Notes
- Tests reference DOM selectors and player APIs; adapt selectors to the implementation. The E2E scripts include TODO placeholders where selectors or URL paths need to be adjusted.
- For per-device persistence (localStorage/IndexedDB), Playwright can inspect the storage to validate saved timestamps.
- Collect raw traces (network + console) on test failures to help debugging.
