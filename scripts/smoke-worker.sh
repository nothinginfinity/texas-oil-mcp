#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://texas-oil-mcp.YOUR_WORKERS_SUBDOMAIN.workers.dev}"

curl -sS "$BASE_URL/health"
curl -sS "$BASE_URL/api/sources"
