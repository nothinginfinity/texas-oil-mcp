#!/usr/bin/env bash
set -euo pipefail

npx wrangler d1 create texas-oil-db
npx wrangler r2 bucket create texas-oil-raw
npx wrangler vectorize create texas-oil-vectorize --dimensions=768 --metric=cosine
npx wrangler vectorize create-metadata-index texas-oil-vectorize --property-name=kind --type=string
npx wrangler vectorize create-metadata-index texas-oil-vectorize --property-name=datasetId --type=string
npx wrangler vectorize create-metadata-index texas-oil-vectorize --property-name=agency --type=string
npx wrangler vectorize create-metadata-index texas-oil-vectorize --property-name=period --type=string
