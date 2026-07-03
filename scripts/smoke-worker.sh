#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  exit 1
fi

curl -sS "$1"/health
curl -sS "$1"/api/sources
