#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <commit-sha|artifact-id>"
  echo "Example: $0 0f1a2b3c"
  exit 1
}

if [ "$#" -ne 1 ]; then
  usage
fi

TARGET="$1"
# This template assumes GH CLI is available and authenticated.
echo "Rolling back Pages site to ${TARGET} (template)."
# Example: clone repo, checkout target commit, build and deploy
TMPDIR="$(mktemp -d)"
REPO_URL=$(git config --get remote.origin.url || echo "")
if [ -z "$REPO_URL" ]; then
  echo "Remote origin URL not found; run rollback from a clone or set remote." >&2
  exit 2
fi

git clone --depth 1 "$REPO_URL" "$TMPDIR/repo"
pushd "$TMPDIR/repo" >/dev/null
if git rev-parse --verify "$TARGET" >/dev/null 2>&1; then
  git checkout "$TARGET"
else
  git fetch origin "$TARGET" && git checkout FETCH_HEAD
fi
# Build and deploy (adjust if project has different build steps)
npm ci
npm run build
# Deploy using gh CLI
if command -v gh >/dev/null 2>&1; then
  gh pages deploy ./dist --branch gh-pages --message "rollback to ${TARGET}"
else
  echo "gh CLI not found; manual deployment required." >&2
  exit 3
fi
popd >/dev/null
rm -rf "$TMPDIR"
echo "Rollback attempt completed. Verify Pages site and CI logs."
