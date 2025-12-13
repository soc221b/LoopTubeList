# AGENTS.md

## Project overview
This project is a static site to help users manage a list of YouTube videos that they want to watch in order to remember important content, following the forgetting curve principle.

## Setup commands
- Install deps: `npm install`, or `npm ci` for CI
- Start dev server: `npm run dev`
- Build project: `npm run build`
- Preview build: `npm run preview`
- Format code: `npm run format`
- Run tests: `npm run test`

## Code style
- Conventional Commits for commit messages
- Semantic versioning for releases
- Test-driven development enforced, must follow red-green-refactor cycle for every feature and bugfix
- Testing with Vitest and React Testing Library, test files located separately in `tests/` directory
- Default Prettier config
- TypeScript strict mode
- Follow React concepts: https://react.dev/
- Bundling with Vite
- Always use `@/` alias for imports from `src/`
- Single Page Application (SPA) architecture

## CI workflow
- Linting
- Running tests
- Type checking and building the project
- GitHub pages deployment

## Agent Workflow
- Always create a new branch for each feature or bugfix, use alphanumeric and hyphen characters only in branch names
- For each feature or bugfix, create a corresponding test first that fails, and wait for it to be reviewed and approved before implementing the feature or bugfix
- After approval, implementation should not touch the test code unless asking for changes
- To implement a feature or bugfix, add minimal code to make the corresponding test pass, then refactor as needed while ensuring all tests still pass
- After implementation, commit changes with a descriptive message following Conventional Commits
