#!/usr/bin/env bash
set -euo pipefail

# Simple HTTP check for local preview (http://localhost:3000/)
URL=${1:-http://localhost:3000/}

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || true)
if [ "$STATUS" != "200" ]; then
  echo "ERROR: $URL returned status $STATUS"
  exit 4
fi

echo "OK: $URL returned 200"
