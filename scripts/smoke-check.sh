#!/usr/bin/env bash
set -euo pipefail

DOCS_INDEX="docs/index.html"
EXPECTED_TEXT="LoopTubeList"

if [ ! -f "$DOCS_INDEX" ]; then
  echo "ERROR: $DOCS_INDEX not found"
  exit 2
fi

if ! grep -q "$EXPECTED_TEXT" "$DOCS_INDEX"; then
  echo "ERROR: Expected text '$EXPECTED_TEXT' not found in $DOCS_INDEX"
  exit 3
fi

echo "OK: $DOCS_INDEX exists and contains expected text"
