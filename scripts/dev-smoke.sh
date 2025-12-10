#!/usr/bin/env bash
set -euo pipefail

echo "Running dev smoke: npm ci && npm run build"
npm ci
npm run build

echo "Build succeeded"
