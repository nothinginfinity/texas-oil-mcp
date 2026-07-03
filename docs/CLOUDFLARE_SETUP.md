# Cloudflare Setup

This repo is now scaffolded for a Cloudflare-native Texas oil data stack.

## Cloudflare resources

The Worker expects these bindings:

| Binding | Product | Purpose |
| --- | --- | --- |
| `DB` | D1 | source registry, ingest runs, normalized SQL tables, citations |
| `RAW_BUCKET` | R2 | raw RRC/EIA/Socrata/manual source payload archive |
| `TEXAS_OIL_VECTORIZE` | Vectorize | embeddings for docs, summaries, schema notes, and RAG context |
| `AI` | Workers AI | embedding generation for Vectorize |

Vectorize is Cloudflare's vector database for semantic search/RAG-style retrieval, and its Worker binding is configured in Wrangler as a `[[vectorize]]` binding. The index dimensions and distance metric are fixed when the index is created, so this repo uses a 768-dimension cosine index for the configured BGE embedding model.

## Manual Cloudflare bootstrap

Run this locally after logging in with Wrangler:

```bash
npm install
npx wrangler login
npm run cf:bootstrap
```

The D1 create command will return a `database_id`. Put that ID into `wrangler.toml` by replacing:

```text
REPLACE_WITH_D1_DATABASE_ID
```

Then apply migrations:

```bash
npm run cf:migrate
```

Set Worker secrets manually:

```bash
npm run cf:secrets
```

Required Worker secret:

- `ADMIN_TOKEN` — choose a long random value for protected admin/upload/vector upsert endpoints.

Optional Worker secret:

- `EIA_API_KEY` — needed when the EIA connector is promoted from scaffold to live API ingestion.

## GitHub Actions deploy secrets

Add these GitHub repository secrets manually before running the deploy workflow:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The Cloudflare API token should be scoped narrowly for this repo's deployment needs:

- Workers Scripts edit/deploy
- D1 edit
- R2 edit
- Vectorize edit
- Workers AI access if your account policy requires it

No R2 S3 access keys are needed for the Worker binding path.

## Validate and deploy

Before deploy, run:

```bash
npm run check
npm run build
npm run check:wrangler
```

After `wrangler.toml` has a real D1 database id and GitHub secrets are set, run:

```bash
npm run deploy
```

Or trigger the GitHub Actions workflow named `Deploy Cloudflare Worker` manually.

## Smoke test

Set the deployed Worker URL locally:

```bash
BASE_URL="https://texas-oil-mcp.YOUR_WORKERS_SUBDOMAIN.workers.dev" npm run smoke:worker
```

To seed source records after deployment, send a protected request to `POST /api/admin/seed-sources` with the configured bearer value.

## Current Worker endpoints

### Public

- `GET /health`
- `GET /api/sources`
- `POST /api/ingest/plan`
- `GET /api/sql-template?template=countyMonthlyProduction`
- `GET /api/chat-context?question=...&preferredSource=mixed`
- `POST /api/vectorize/query`
- `GET /api/raw/<key>`

### Admin protected

These require:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

- `POST /api/admin/seed-sources`
- `PUT /api/raw/<key>`
- `POST /api/vectorize/upsert`

## Data-size strategy

Use R2 for raw bulk files first. Do not push massive RRC dumps directly into D1. Parse them in batch, preserve checksums, then publish normalized entities and summary tables into D1. Use Vectorize for documents, schema explanations, generated reports, and search chunks — not as the source of truth for numeric production values.
