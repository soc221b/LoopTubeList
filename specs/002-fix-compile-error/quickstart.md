```markdown
# Quickstart: Reproduce and Verify Dev Server Fix

1. Ensure Node 18 is active (use `nvm use 18` or similar). Add `.nvmrc` to the repo when applying the fix.
2. Clone the repo and install dependencies:

```bash
git clone git@github.com:soc221b/LoopTubeList.git
cd LoopTubeList
npm ci
```

3. Start the dev server and capture logs:

```bash
npm run dev 2>&1 | tee dev-compile.log
```

4. If `dev-compile.log` contains `Failed to compile`, open the log and inspect the first diagnostic. Apply the fix, then re-run the quickstart to confirm the dev server starts and the primary page loads at `http://localhost:3000`.

5. After the fix is merged, verify the CI smoke job (`npm run build`) passes on the branch.

```
