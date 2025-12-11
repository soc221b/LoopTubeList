# Feature Specification: Spaced Repetition Playlist

**Feature Branch**: `001-spaced-repetition-playlist`
**Created**: 2025-12-11T04:09:39.481Z
**Status**: Draft
**Input**: User description: "Build an web application that can help users play their youtube videos. Users visit this app can provide their youtube video links to create a playlist (not the playlist of youtube, but the playlist in this app). This app should remember what users have watched, and what timestamp they have watched. Users can continue watching from the timestamp they have watched last time, even if they close the app and come back later, the app should remember their progress. The videos in the playlist should be determined by the forgetting curve, so that the videos that users have not watched for a long time will be played first. The app should have a simple and clean user interface. The users can see the list of videos in the playlist, and the status of each video (watched or not watched). The users can remove videos from the playlist. The app should be responsive and work well on both desktop and mobile devices."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Play Videos (Priority: P1)
A casual user can add one or more YouTube video links and play them in the app's playlist.

Why this priority: Core user value—allows users to build and consume an ordered list of videos within the app.

Independent Test: Add three valid YouTube links → open player → play each video → verify player starts and shows correct title and seek bar.

Acceptance Scenarios:
1. Given an empty playlist, When user pastes a valid YouTube link and submits, Then the video is added to the playlist and visible in the list.
2. Given a playlist with videos, When user selects a video, Then the player loads the video and begins playback from the stored timestamp (or start if never watched).

---

### User Story 2 - Persistent Progress & Resume (Priority: P1)
Users can resume a video from the last watched timestamp even after closing and reopening the app.

Why this priority: Resuming progress is a primary usability requirement and prevents repeated watching or lost context.

Independent Test: Play a video for 45 seconds → close the app → reopen the app → open the same video → verify playback resumes within 2 seconds of the previously recorded timestamp ± 3 seconds.

Acceptance Scenarios:
1. Given a partially watched video, When user returns to the video, Then playback resumes at the last saved timestamp.
2. Given a video that was watched to completion, When user returns later, Then status shows as 'watched' and progress is at the end.

---

### User Story 3 - Spaced-Repetition Ordering & Playlist Management (Priority: P2)
The playlist ordering prioritizes videos according to a forgetting-curve-inspired score so that videos not watched recently appear earlier.

Why this priority: Helps users focus on content they are most likely to forget and supports repeated review.

Independent Test: Given a playlist with varied last-watched timestamps, run the ordering algorithm → verify videos are listed in descending priority (least recently watched first).

Acceptance Scenarios:
1. Given multiple videos with different last-watched times, When the playlist is viewed or shuffled by priority, Then videos not watched for the longest time are ordered earlier.
2. Given a user removes a video, When the user confirms removal, Then the video is deleted from the playlist and order updates.

---

### Additional Flows (P3)
- User can manually remove videos from the playlist and confirm deletion.
- User can view each video's status: Not watched / In progress (with timestamp) / Watched.
- UI is responsive: playlist and player adapt to desktop and mobile viewports.

### Edge Cases
- Invalid or non-public YouTube links should be rejected with a clear error message.
- Duplicate links: either deduplicate on add or allow duplicates with user-visible warnings (see Assumptions).
- Private or geo-restricted videos cannot be played; user should be informed.

## Requirements *(mandatory)*

### Functional Requirements
- FR-001: The system MUST allow users to add a YouTube video URL to the playlist.
- FR-002: The system MUST present the playlist with video title, thumbnail, duration, and current status (Not watched, In progress, Watched).
- FR-003: The system MUST play videos in the app UI and support seeking to a stored timestamp.
- FR-004: The system MUST record per-video watch progress (timestamp and last-watched datetime) after playback pauses/stops.
- FR-005: The system MUST allow users to remove videos from the playlist with confirmation.
- FR-006: The system MUST present an ordering mode that sorts videos by a forgetting-curve-inspired priority score (least recently watched first by default).
- FR-007: The system MUST expose an API or UI action to re-order the playlist manually (optional enhancement).
- FR-008: The system MUST validate input links and surface user-friendly errors for invalid/unplayable videos.

### Non-Functional Requirements (Constitutional)
- NFR-001 (Code Quality): Changes MUST pass repository linters and formatters and include documentation for public behaviors.
- NFR-002 (Testing): Tests MUST be provided: unit tests for scoring/order logic, integration tests for add/play/remove flows, and regression checks for resume behavior.
- NFR-003 (UX): UI must be simple and clean; error messages and accessible labels must be included in acceptance criteria.
- NFR-004 (Performance): Primary user flows (open playlist, start/resume playback) SHOULD respond quickly on typical consumer connections and devices (see Success Criteria for targets).

### Key Entities
- Video
  - Attributes: id, source_url, title, thumbnail_url, duration_seconds, last_watched_at, last_watched_position_seconds, watch_status
- Playlist
  - Attributes: id, name, ordered list of Video references, ordering_mode
- WatchRecord (per video per user/device)
  - Attributes: video_id, last_position_seconds, last_watched_at
- UserProfile (optional)
  - Attributes: id, display_name, settings (used if cross-device sync is enabled)

## Success Criteria *(mandatory)*

### Measurable Outcomes
- SC-001: 95% of resume attempts continue playback within 2 seconds of user action on typical consumer devices.
- SC-002: 90% of users can add a video and start playback within 30 seconds of first visit (on average mobile 4G conditions).
- SC-003: Playlist ordering places the least-recently-watched videos in the top 3 positions for 95% of test cases derived from sample watch histories.
- SC-004: Users can remove videos with a single confirm action and observe the playlist update immediately (visual confirmation in UI).
- SC-005: Accessibility: core player controls are reachable by keyboard and labeled for screen readers.

## Measurement & Validation Plan

This section defines how each Success Criterion will be measured, reported, and considered passing. The full automated test plan and scripts are described in specs/001-spaced-repetition-playlist/checklists/test-plan.md; the items below summarize the measurable procedures and expected report artifacts.

- Reporting format: All automated runs MUST emit JSON reports under reports/<type>/<timestamp>-report.json with these common fields where applicable: {"total_runs":N, "within_threshold":M, "p95_ms":X, "pass":true|false, "notes":[...]}

- SC-001 (Resume latency):
  - Measurement: Automated E2E harness (Playwright) performs N=100 resume attempts; records elapsed_ms from user action (play) to media currentTime >= saved_position - 3s tolerance.
  - Threshold: pass if (within_threshold / total_runs) >= 0.95 and p95_latency_ms <= 2000.
  - Report artifact: reports/resume-latency/<timestamp>-report.json

- SC-002 (First-play on first visit):
  - Measurement: Playwright runs M=50 first-visit flows under emulated slow-4G network; measure time from initial page load to playback start.
  - Threshold: pass if (within_threshold / total_runs) >= 0.90 and median_time_s <= 30.
  - Report artifact: reports/first-play/<timestamp>-report.json

- SC-003 (Ordering correctness):
  - Measurement: Deterministic unit tests (Jest) run against scoring function with fixture datasets; test asserts top-3 positions for N fixtures.
  - Threshold: pass if all unit tests pass (0 failing) and property tests for monotonicity hold.
  - Report artifact: reports/unit/<timestamp>-report.json (test summary)

- SC-004 (Add/remove immediate UI update):
  - Measurement: Playwright E2E test adds items, removes an item, and asserts UI and persistence (localStorage/IndexedDB) reflect the change within 1s for K runs.
  - Threshold: pass if (within_threshold / total_runs) >= 0.95.
  - Report artifact: reports/add-remove/<timestamp>-report.json

- SC-005 (Accessibility):
  - Measurement: Automated axe-core scan via Playwright on key pages + manual checklist run (keyboard navigation and a screen-reader smoke test).
  - Threshold: pass if automated scan reports no critical or serious violations and manual checklist passes.
  - Report artifact: reports/accessibility/<timestamp>-report.json and docs/accessibility-manual-checklist.md

Validation rule: the feature is considered to "meet measurable outcomes" when the required reports exist and all the thresholds above are satisfied. For the purposes of planning and spec completeness, inclusion of this Measurement & Validation Plan and links to the test-plan constitutes readiness to execute validation; final pass marking will be set when the execution artifacts exist in the reports/ directory.

## Assumptions
- Default persistence: progress is stored persistently and will survive closing the app on the same device. Cross-device sync (account-based) is considered an optional enhancement and requires explicit clarification and acceptance (see NEEDS CLARIFICATION below).
- The app must support playback of referenced YouTube videos with resumable position tracking; specific playback integration approaches are out of scope of this specification.
- The forgetting-curve ordering uses a time-since-last-watch scoring heuristic by default; scoring refinements (e.g., spacing intervals, decay functions) can be iterated later.

## Persistence Scope
Per-device persistence is sufficient: progress is stored locally and survives closing the app on the same device. Cross-device sync (account-based) is an optional enhancement and requires explicit authentication, backend storage, and migration considerations; it is out of scope for the initial delivery.


## Governance
Link this spec to the implementation plan and tasks; include a "Constitution Check" listing code quality, testing, UX, and performance gates in the plan.

