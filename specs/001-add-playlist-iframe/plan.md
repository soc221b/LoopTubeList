# Implementation Plan: Play YouTube Playlist via Iframe

**Branch**: `001-add-playlist-iframe` | **Date**: 2025-12-10 | **Spec**: `specs/001-add-playlist-iframe/spec.md`
**Input**: Feature specification from `specs/001-add-playlist-iframe/spec.md`

## Summary

Small frontend-only MVP that accepts a single YouTube playlist URL, extracts the playlist identifier, and embeds the playlist in a controlled iframe on the same page. Phase 1 uses Next.js (App Router) + TypeScript with Tailwind for styling, Jest + React Testing Library for tests, and `@biomejs/biome` for lint/format. The plan intentionally avoids server-side APIs and YouTube Data API for Phase 1 to keep the MVP simple and deployable as a static/edge site.

## Technical Context

**Language/Version**: TypeScript (target ES2022+), Node.js 18+ for local tooling
**Primary Dependencies**: `next` (App Router), `react`, `react-dom`, `tailwindcss`, `@biomejs/biome` (lint/format), `jest`, `@testing-library/react`, `ts-jest`
**Storage**: N/A (no persistence in Phase 1)
**Testing**: Jest + React Testing Library for unit/component tests; isolated unit tests for parsing utility
**Target Platform**: Modern web browsers (desktop & mobile); deployable to static/edge hosts (Vercel, Netlify, static hosts)
**Project Type**: Frontend web application (Next.js App Router)
**Performance Goals**: Fast initial load for a single-page flow; keep bundle minimal and avoid heavy client-side libraries
**Constraints**: No backend or API keys for Phase 1; playlist validation via client-side parsing only; avoid exposing user input as HTML (XSS protection)
**Scale/Scope**: MVP — single feature page, tiny codebase (~1–2 components + utils + tests)

## Constitution Check

GATE: Constitution file is informational; there are no governance violations for this small frontend-only feature. Phase 1 adheres to the project principle of starting small, being testable, and documenting decisions. If organization-level gates exist they must be re-evaluated by reviewers, but no automatic blockers are present in `.specify/memory/constitution.md`.

## Project Structure

### Documentation (this feature)

```
specs/001-add-playlist-iframe/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 quickstart (bootstrap instructions)
├── contracts/           # Notes about API contracts (Phase 2 optional)
└── checklists/
```

### Source Code (scaffold location)

Will create the Next.js App Router application at the repository root when the bootstrap is approved. Use `create-next-app` with the repository root as the target (i.e. `.`). The intended layout at repo root:

```
app/
├── page.tsx                    # Main page with input + player
components/
├── PlaylistPlayer.tsx          # Renders controlled iframe
utils/
├── parsePlaylistId.ts          # Parsing & validation logic (unit-tested)
styles/
├── globals.css                 # Tailwind entry
jest.config.cjs
biome.toml                      # Biome config (use with `@biomejs/biome`)
package.json
```

**Structure Decision**: Use the repository root as the Next.js app root (created by running `npx create-next-app@latest . --app --tailwind --eslint --ts --use-npm`) so the project follows a simple single-app layout. The feature remains frontend-only for Phase 1; no backend directory will be created.

## Complexity Tracking

No constitution violations identified. Complexity is intentionally low: client-side parsing + iframe embedding. If downstream requirements demand playlist metadata or server-side validation, we'll add a backend in Phase 2 and justify via the complexity tracking table.

## React Implementation Guidelines

Implementation must follow React's official guidance and best practices as documented at https://react.dev/. Key rules and decisions for Phase 1:

- **Component model**: Use functional components and React hooks exclusively. Avoid class components.
- **Rules of Hooks**: Follow the Rules of Hooks (call hooks only at the top level and only from React functions). This prevents subtle bugs and ensures predictable behavior.
- **Server vs Client components**: In Next.js App Router, prefer server components for static UI where possible; mark interactive pieces (the playlist input and player UI) as client components (`'use client'`) and keep the interactive state local to those components.
- **State management**: Keep state minimal and local (e.g., input value, parsed playlist id, embed state). Use immutable updates and avoid mutating props or state directly.
- **Effects & cleanup**: Use `useEffect` for side effects and always clean up effects (e.g., event listeners) to avoid leaks. Do not manipulate the DOM directly; use refs with care when necessary (e.g., focusing the input) and clean up after use.
- **No innerHTML**: Never use `dangerouslySetInnerHTML` with user input. Set iframe `src` via props or refs after validation; do not inject raw user content into the DOM.
- **Keys & lists**: Provide stable keys when rendering lists of elements, if any become necessary in UI expansions.
- **Accessibility**: Ensure the input and player are accessible: label the input, provide visible focus states, support keyboard controls for playback controls where possible, and include ARIA attributes for error messages.
- **TypeScript**: Use strict TypeScript settings as specified in the plan; type component props, utility functions (parsing), and test mocks. Prefer narrow types for the playlist ID (string alias) and explicit union types for embed states and errors.
- **Testing**: Use React Testing Library to test components as users would interact with them (e.g., paste input, click Play, assert iframe `src` or error message). Write unit tests for the parsing utility to cover URL variants and edge cases.
- **Performance & bundle size**: Keep dependencies minimal and avoid heavy client-only libraries. Lazy-load optional code if/when needed.

Adhering to these rules will ensure the implementation is idiomatic, maintainable, and compatible with Next.js App Router and the TypeScript setup.

## TypeScript Guidelines

Implementation must follow TypeScript best practices and the guidance from the TypeScript handbook (see: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html). Key rules and practices for this project:

- **Enable strict mode**: Use `"strict": true` in `tsconfig.json` (includes `noImplicitAny`, `strictNullChecks`, etc.). Treat any compiler warning as actionable.
- **Avoid `any`**: Do not use `any` except in very narrow bootstrapping situations; prefer `unknown` when the value is truly dynamic and validate/cast before use.
- **Prefer explicit types for public APIs**: Exported functions, utilities, and component props should have explicit type annotations (avoid relying on type inference for public surfaces).
- **Use interfaces for object shapes**: Prefer `interface` for public object shapes and `type` for unions/aliases where appropriate. Keep interfaces minimal and composable.
- **Readonly & immutability**: Use `readonly` for arrays/objects that should not be mutated and prefer immutable updates for state transformations.
- **No non-null assertions**: Avoid `!` (non-null assertion) unless there is a proven runtime invariant and document why it is safe.
- **Narrow types and guards**: Use type guards and narrowing when handling values from parsing (e.g., `parsePlaylistId`) — validate inputs and narrow to specific types before use.
- **Strict function return types**: Annotate return types for utility functions and handlers to make behavior explicit and easier to test.
- **Use `as const` for literal tuples/objects** when exact literal types are needed (e.g., enum-like arrays) to preserve literal types.
- **Centralize shared types**: Put shared TypeScript types in `types/` or `utils/types.ts` and reference them across components and tests to avoid drift.
- **Test type-level invariants when helpful**: Use small compile-time tests or `ts-expect-error` comments in a dedicated `types.test.ts` when you need to assert type behavior.
- **Keep tsconfig consistent across the project**: Document required `tsconfig.json` settings in the repo `README`/quickstart so contributors use the same strict settings.

Following these TypeScript practices will make the code safer, easier to review, and reduce runtime surprises when parsing and handling user-supplied playlist URLs.

## Clean Code Guidelines (JavaScript / TypeScript)

Follow clean code principles adapted for JavaScript/TypeScript — see the project's guideline at https://github.com/ryanmcdermott/clean-code-javascript (recommended commit: 5311f64). Key actionable rules for this implementation:

- **Small, focused functions**: Prefer many small functions with a single responsibility. Each function should do one thing and do it well.
- **Descriptive naming**: Use intention-revealing names for variables, functions, and types. Avoid abbreviations and generic names like `data` or `item` when more specific names are available.
- **Limit nesting**: Flatten nested conditionals and return early to reduce cognitive load.
- **Avoid side-effects**: Functions should avoid unexpected side-effects; prefer pure functions for parsing and validation utilities.
- **Single Level of Abstraction per Function**: Keep function internals at a consistent level of abstraction; if helper logic is needed, extract it into a descriptive function.
- **Consistent formatting & style**: Use `@biomejs/biome` config to enforce consistent formatting, spacing, and ordering. Keep lint rules strict to avoid style debates.
- **Comment sparingly**: Prefer expressive code over comments. Use comments to explain *why* not *what*. Remove commented-out code.
- **Error handling**: Handle errors explicitly and fail fast for invalid inputs. Surface user-facing errors through well-typed error objects (avoid throwing ambiguous strings).
- **DRY, but not at the expense of clarity**: Avoid duplication where it clearly harms maintainability but favor clarity over clever abstraction.
- **Readable tests**: Write tests that read like documentation — arrange, act, assert; use descriptive test names covering happy path and edge cases (parsing invalid URLs, un-embeddable playlists).
- **Refactor mercilessly**: When code smells appear during reviews or development, refactor to clarify intent and reduce complexity.

Applying these clean code rules alongside the React and TypeScript guidelines will keep the codebase easy to review, test, and maintain as the feature grows.

## Accessibility (A11y)

Follow web accessibility best practices (see https://web.dev/accessibility#new-to-accessibility). Concrete requirements for Phase 1:

- **Semantic HTML**: Use native HTML controls (`<form>`, `<label>`, `<input>`, `<button>`) and landmark elements (`<main>`, `<header>`, `<nav>`, `<footer>`) to provide a strong accessibility baseline.
- **Form labels & instructions**: Ensure the playlist input has an explicit `<label>` and clear helper text. Announce validation errors via accessible error text and `aria-describedby`.
- **Keyboard navigation**: All interactive elements must be reachable and operable with keyboard only (Tab/Shift+Tab, Enter/Space for activation). Provide visible focus indicators.
- **ARIA only when necessary**: Prefer native semantics; add ARIA roles/properties only when they enhance accessibility (e.g., `role="alert"` for transient error messages or `aria-live="polite"` for non-blocking status updates).
- **Color & contrast**: Ensure color contrast meets WCAG AA for text and UI controls. Avoid conveying information by color alone.
- **Accessible iframe**: When embedding the YouTube iframe, include a descriptive `title` attribute, ensure keyboard focus handling around the iframe is sensible, and provide fallback text/error message if embedding fails.
- **Screen reader testing**: Smoke-test the primary flow with a screen reader (NVDA/VoiceOver) to ensure labels, errors, and focus behave correctly.
- **Automated checks**: Integrate accessibility linters (e.g., `axe-core` or `eslint-plugin-jsx-a11y`) into CI and run Lighthouse accessibility audits during verification.
- **Skip links & focus management**: Add a `Skip to content` link for keyboard users and manage focus when showing errors or navigating between UI states (move focus to the first error or to the player when it appears).
- **Documentation**: Document accessibility considerations in the `README`/quickstart and include test steps for manual accessibility checks.

Meeting these accessibility requirements is mandatory for Phase 1; address any violations before merging.

## Performance & Web Vitals

This feature must aim for excellent Core Web Vitals and general frontend performance. Follow the guidance at https://web.dev/articles/vitals and measure in lab and field. Concrete goals and practices for Phase 1:

- **Target metrics (field-oriented):**
	- Largest Contentful Paint (LCP): < 2.5s (good)
	- Interaction to Next Paint / First Input Delay (INP/FID): INP < 200ms (or FID <100ms for non-INP measurement)
	- Cumulative Layout Shift (CLS): < 0.1

- **Bundle & load goals:**
	- Keep main client JS bundle minimal (target < 200 KB gzipped for initial load where practical).
	- Avoid blocking third-party scripts on initial load.

- **Implementation techniques:**
	- Use Next.js server components where possible to reduce client hydration.
	- Mark interactive parts as client components (`'use client'`) only when needed to limit JS shipped to the client.
	- Defer non-critical JS; use dynamic imports and React.lazy for optional code paths.
	- Use `loading="lazy"` for the iframe where appropriate and ensure the player UI remains responsive while the iframe loads.
	- Preconnect/prefetch for required external origins (e.g., `https://www.youtube.com`) to improve handshake times.
	- Avoid render-blocking CSS; keep Tailwind build minimal and purge unused styles in production.
	- Keep images optimized (use Next.js Image optimization if images are added later) and avoid heavy fonts; use font-display: swap or load fonts asynchronously.

- **Measurement & monitoring:**
	- Add `web-vitals` (npm package) to capture LCP/CLS/INP/FID in production and forward metrics to your analytics/RUM endpoint or log them for diagnosis.
	- Use Lighthouse (local) and Lighthouse CI for automated checks in PRs if desired.
	- Run manual Lighthouse audits (DevTools) and test on mobile network throttling and CPU throttling during verification.

- **Verification for Phase 1:**
	- Run Lighthouse for the primary page and verify LCP/CLS/INP in the 'Good' ranges on mobile emulation or real devices where possible.
	- Add at least one automated CI job (optional) that runs `npx lighthouse-ci` or a Lighthouse script against a deployed preview and gates major regressions.

Following these Web Vitals goals and practices will keep the MVP fast and provide a clear path to monitor and improve performance as the feature grows.
