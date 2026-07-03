#!/usr/bin/env bash
set -euo pipefail

if [ -z "${BASE_URL:-}" ]; then
  echo "Set BASE_URL before running smoke-worker.sh"
  exit 1
fi

curl -sS "$BASE_URL/health"
curl -sS "$BASE_URL/api/sources"
