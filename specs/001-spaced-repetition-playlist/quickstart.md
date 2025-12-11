# Quickstart: Spaced Repetition Playlist (Vite + React + TypeScript)

Prerequisites
- Node 24 LTS or newer
- npm or yarn

Local development

1. Create the project (if starting fresh):

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

2. Install dependencies

```bash
npm install
npm install zustand tailwindcss postcss autoprefixer idb-keyval
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
```

3. Tailwind setup (if starting fresh)

```bash
npx tailwindcss init -p
# configure tailwind.config.js to include ./src/**/*.{js,ts,jsx,tsx}
```

4. Run dev server

```bash
npm run dev
```

Testing

```bash
npm run test:unit   # vitest
# E2E (optional): npx playwright test
```

Notes

- If adding Playwright-based performance tests, run `npx playwright install --with-deps` to install browsers.
- For per-device persistence during development, localStorage is acceptable; for larger-scale/local files, consider IndexedDB via idb-keyval.
