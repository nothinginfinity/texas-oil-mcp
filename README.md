# Texas Oil MCP

Compliant MCP server and data pipeline for Texas oil and gas intelligence.

This repo is designed to turn official Texas oil and gas public data into a normalized database and cited chat layer without scraping prohibited Railroad Commission of Texas web query systems.

## Goal

Build a massive Texas oil chat capability over:

- Railroad Commission of Texas public bulk downloads and reports
- EIA state and regional energy APIs
- Texas Open Data / Socrata records
- normalized SQL tables for leases, operators, counties, districts, fields, wellbores, and monthly production
- RAG-ready documents and chunks for cited analyst answers

## Safety rule

This project must not automate, scrape, crawl, or bypass RRC interactive research query systems. It should ingest official public bulk files, API endpoints, and manually registered source documents.

## Current status

Phase 0 scaffold.

Included:

- TypeScript MCP server scaffold
- source registry
- RRC/EIA/Socrata connector placeholders
- D1/SQLite-compatible schema
- fixed-width parsing helper
- roadmap
- architecture, compliance, data-source, and MCP tool docs

## Quick start

```bash
npm install
npm run check
npm run build
npm run dev
```

## MCP tools in scaffold

- `rrc_list_datasets`
- `rrc_plan_ingest`
- `texas_oil_sql_template`
- `texas_oil_confidence_guide`
- `texas_oil_chat_context`

These tools currently provide source registry, ingest planning, SQL templates, and analyst context. The roadmap tracks the path to real ingestion and query execution.

## Architecture

```text
Official public sources
  -> raw file registry
  -> ingest runs
  -> normalized SQL tables
  -> summary/query indexes
  -> vector/RAG documents
  -> MCP tools
  -> cited Texas oil analyst chat
```

## Repo layout

```text
src/
  index.ts                  MCP server entrypoint
  config.ts                 runtime config
  types.ts                  shared domain types
  mcp/tools.ts              tool registration
  sources/registry.ts       source registry
  sources/rrc.ts            RRC bulk-source helpers
  sources/eia.ts            EIA API helpers
  sources/socrata.ts        Texas Open Data helpers
  etl/fixedWidth.ts         fixed-width parser
  etl/ingest.ts             ingest planning
  db/schema.ts              embedded schema text
  lib/citations.ts          citation helpers
migrations/
  0001_initial.sql          normalized schema
seeds/
  source-registry.json      seed source metadata
docs/
  ARCHITECTURE.md
  DATA_SOURCES.md
  COMPLIANCE.md
  MCP_TOOLS.md
examples/
  questions.md
ROADMAP.md
```

## Intended deployment tracks

### Local analyst MCP

Runs over stdio from Claude Desktop, Cursor, ChatGPT connector workflows, or local agent systems.

### Cloudflare-native data layer

- R2 for raw archives
- D1 for manifests, normalized indexes, and summary tables
- Vectorize for semantic retrieval over docs, summaries, and schema explanations
- Workers for HTTP query surfaces

### Heavy ETL layer

Large raw production dumps may be parsed outside D1 first using DuckDB, SQLite, Postgres, or batch workers, then reduced into queryable indexes.

## License

MIT
