#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://texas-oil-mcp.YOUR_WORKERS_SUBDOMAIN.workers.dev}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"

curl -sS "$BASE_URL/health"
curl -sS "$BASE_URL/api/sources"

if [ -n "$ADMIN_TOKEN" ]; then
  curl -sS -X POST "$BASE_URL/api/admin/seed-sources" -H "authorization: Bearer $ADMIN_TOKEN"
fi
