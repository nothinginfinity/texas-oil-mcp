#!/usr/bin/env bash
set -euo pipefail

npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put EIA_API_KEY
