#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://texas-oil-mcp.YOUR_WORKERS_SUBDOMAIN.workers.dev}"
AUTH_VALUE="${AUTH_VALUE:-}"

curl -sS "$BASE_URL/health"
curl -sS "$BASE_URL/api/sources"

if [ -n "$AUTH_VALUE" ]; then
  curl -sS -X POST "$BASE_URL/api/admin/seed-sources" -H "authorization: Bearer $AUTH_VALUE"
fi
