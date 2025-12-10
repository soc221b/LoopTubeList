# Feature Specification: Play YouTube Playlist via Iframe

**Feature Branch**: `001-add-playlist-iframe`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "Create a website which accepts user to type one link of youtube playlist and play it with iframe."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play pasted YouTube playlist (Priority: P1)

A visitor opens the site, pastes a single YouTube playlist link into an input field, submits it, and the site begins playing the playlist inside an embedded player (iframe) on the same page.

**Why this priority**: This is the core user value — quickly play a playlist without copying individual video links or leaving the page.

**Independent Test**: Paste a known valid YouTube playlist URL into the input field and verify the playlist starts playing in the embedded player.

**Acceptance Scenarios**:

1. **Given** an empty page, **When** the user pastes a valid YouTube playlist URL and clicks "Play", **Then** an embedded player appears and the first item of the playlist begins playing.
2. **Given** a valid playlist, **When** the user reloads the page, **Then** the input remains empty (no persistence required for MVP) and the player does not auto-start unless the user submits again.

---

### User Story 2 - Handle invalid or non-playlist links (Priority: P2)

If a user submits an invalid URL, a non-YouTube URL, or a YouTube URL that doesn't include a playlist, the site displays a clear, actionable error message and does not render a player.

**Why this priority**: Prevents confusion and gives clear feedback for remedial action.

**Independent Test**: Submit a plain text string, a single-video YouTube URL, and a malformed URL; verify the appropriate error message appears and no player is embedded.

**Acceptance Scenarios**:

1. **Given** an invalid URL, **When** the user submits it, **Then** the page shows "Invalid playlist URL" and focuses the input for correction.

---

### User Story 3 - Mobile and responsive playback (Priority: P3)

The site displays the input and player responsively across common screen sizes; the player resizes to fit available width while maintaining correct aspect ratio.

**Why this priority**: Many users will paste links from mobile devices; good UX increases adoption.

**Independent Test**: Open the page on mobile or a narrow viewport, paste a valid playlist, and confirm the player fits the screen and controls are usable.

**Acceptance Scenarios**:

1. **Given** a small viewport, **When** the user plays a playlist, **Then** the player scales and remains usable without horizontal scrolling.

---

### Edge Cases

- User pastes a YouTube single-video URL (not a playlist): show a message explaining a playlist link is required and suggest copying the playlist from YouTube.
- Playlist is private or un-embeddable: detect playback failure in the embedded player (player API event or iframe load failure) and show "This playlist cannot be embedded or is private." message.
- Very long or malformed input: trim whitespace, validate length, and reject obviously invalid inputs with an error.
- Network or YouTube service errors: show a transient error recommending retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST accept a single user-supplied input string representing a YouTube playlist link.
- **FR-002**: The site MUST validate the input and determine whether it contains a YouTube playlist identifier; valid formats include common YouTube playlist URLs and share links.
- **FR-003**: The site MUST extract the playlist identifier from valid inputs and construct an embeddable player view that plays the playlist inside an iframe on the same page.
- **FR-004**: If input is invalid, the site MUST show a clear, actionable error message and prevent player embedding.
- **FR-005**: The site MUST handle playback failures (private/un-embeddable playlists or service errors) and show a specific error message describing the issue.
- **FR-006**: The site MUST be responsive so the input and the embedded player are usable on desktop and mobile viewports.
- **FR-007**: The site MUST sanitize user input to prevent injection/XSS in any rendered content.

### Key Entities

- **PlaylistInput**: The raw user input string (attributes: `value`, `trimmed`, `submittedAt`).
- **PlaylistID**: The parsed YouTube playlist identifier (attributes: `id`, `sourceFormat`).
- **EmbedState**: Representation of the current player state (attributes: `isPlaying`, `lastError`, `visible`).

## Success Criteria *(mandatory)*

### Success Criteria

- **SC-001**: A user can paste a valid YouTube playlist link and start playback inside the embedded player within 5 seconds of submitting (measured in a standard broadband connection).
- **SC-002**: 95% of commonly formatted YouTube playlist URLs (including `list=` query and share links) provided in test cases are accepted and start playing.
- **SC-003**: When an invalid or un-embeddable playlist link is submitted, the system displays a clear error message in 100% of cases and does not render an unusable player.
- **SC-004**: The primary flow (paste → submit → play) has a task completion success rate ≥ 90% in basic usability testing with 10 users.

### Assumptions

- The scope is an MVP single-page site with no user accounts or persistence.
- The requirement to "play with iframe" means using YouTube's standard embeddable player in an iframe; handling advanced player APIs is out of scope for MVP.
- The site is public-facing and will rely on YouTube's embedding policies; private or blocked playlists may not be playable.

### Measurable Outcomes

- **SC-001**: A user can paste a valid YouTube playlist link and start playback inside the embedded player within 5 seconds of submitting (measured on a standard broadband connection).
- **SC-002**: 95% of commonly formatted YouTube playlist URLs (including `list=` query forms, `watch` URLs with `list`, and `youtu.be` share links) in a representative test set are accepted and begin playback.
- **SC-003**: For invalid or un-embeddable playlist links, the app displays a clear, actionable error message and does not render an unusable player in 100% of test cases.
- **SC-004**: In a basic usability test with 10 participants performing the primary flow (paste → submit → play), at least 90% complete the task without assistance.
