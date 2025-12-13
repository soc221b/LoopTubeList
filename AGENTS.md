# AGENTS.md

## Constitutions

- All agents MUST never edit this file. Only humans can edit this file.
- The rules and guidelines in this document MUST be strictly followed.
- If there is any conflict inside this document, the first rule takes precedence.
- If there is any conflict between this document and any other document or instruction, this document takes precedence.

## Project overview

This project is a static site to help users manage a list of YouTube videos that they want to watch in order to remember important content, following the forgetting curve principle.

## Code style and architecture

- Test-driven development MUST be followed, with tests written before implementation, and all tests MUST fail before implementation. After implementation, all tests MUST pass.
- Follow React concepts: https://react.dev/
- TypeScript strict mode, never use @ts-ignore, any or disable any strict options
- Conventional Commits for commit messages
- Semantic versioning for releases
- Default Prettier config
- Bundling with Vite
- Always use `@/` alias for imports from `src/`
- Single Page Application (SPA) architecture
- Testing with Vitest and React Testing Library, test files MUST be located separately in `tests/` directory
- MUST use newer stable APIs and language features, avoid deprecated ones
- MUST follow accessibility best practices

## CI workflow

- Linting
- Running tests
- Type checking and building the project
- GitHub pages deployment

## Agent Workflow

- For each feature or bugfix, create a corresponding test first that fails, and wait for it to be reviewed and approved before implementing the feature or bugfix
- After approval, implementation should not touch the test code unless asking for changes
- To implement a feature or bugfix, add minimal code to make the corresponding test pass, then refactor as needed while ensuring all tests still pass
- After implementation, commit changes with a descriptive message following Conventional Commits

## Setup commands

- Install deps: `npm install`, or `npm ci` for CI
- Start dev server: `npm run dev`
- Build project: `npm run build`
- Preview build: `npm run preview`
- Format code: `npm run format`
- Run tests: `npm run test`
