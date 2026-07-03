#!/usr/bin/env bash
set -euo pipefail

npx wrangler d1 migrations apply texas-oil-db --remote
