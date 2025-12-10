# LoopTubeList

Quickstart — Local development

Prerequisites:

- Node.js 18 (use `nvm use 18` or install from https://nodejs.org/) — repository includes `.nvmrc`
- npm installed

Setup and run:

```bash
git clone git@github.com:soc221b/LoopTubeList.git
cd LoopTubeList
nvm use 18
npm ci
# Start development server
npm run dev

# Or run a smoke build check
./scripts/dev-smoke.sh
```

If you encounter `Failed to compile`, run the smoke script and open `specs/002-fix-compile-error/research.md` for reproduction steps and root-cause notes.
