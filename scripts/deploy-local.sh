#!/usr/bin/env bash
set -euo pipefail

# Simple deploy-local helper using gh CLI
if [ ! -f dist/index.html ]; then
  echo "dist/index.html not found. Run 'npm run build' first." >&2
  exit 1
fi
# Ensure gh is installed and authenticated
if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not installed. Install GitHub CLI: https://cli.github.com/" >&2
  exit 2
fi
# Deploy
gh pages deploy ./dist --branch gh-pages --message "local deploy"
