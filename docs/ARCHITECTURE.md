# Architecture

## System shape

```text
source registry
  -> approved source connectors
  -> raw archive
  -> ingest runs
  -> parser/layout validation
  -> normalized SQL tables
  -> summary indexes
  -> document/chunk RAG layer
  -> MCP tools
  -> cited analyst chat
```

## Layers

### 1. Source registry

The registry is the gatekeeper. Every source has:

- source class
- agency
- landing page
- automation approval status
- expected refresh cadence
- confidence class
- compliance notes

The registry intentionally includes disallowed source classes so agents can refuse unsafe ingest plans deterministically.

### 2. Raw archive

Raw files should be stored before parsing.

Local MVP:

```text
data/raw/<dataset_id>/<ingest_run_id>/<filename>
```

Cloudflare target:

```text
R2 bucket: texas-oil-raw
key: raw/<dataset_id>/<ingest_run_id>/<filename>
```

### 3. Normalized database

The SQL schema is D1/SQLite-compatible for early development.

Heavy production dumps may require DuckDB/Postgres during parsing before publishing reduced indexes into D1.

### 4. RAG layer

RAG should be used for explanations, documentation, schema notes, and generated monthly reports. Numeric claims should come from SQL tables whenever possible.

### 5. MCP layer

MCP tools should expose:

- source listing
- ingest planning
- dataset loading
- SQL-backed production queries
- entity profiles
- report generation
- citation lineage

## Deployment targets

### Local

Node stdio MCP server for local agent clients.

### Cloudflare

- R2 for raw data
- D1 for metadata and normalized summaries
- Vectorize for retrieval
- Workers for HTTP APIs and scheduled jobs

## Trust model

Every numeric answer needs lineage:

```text
agency -> dataset -> source file -> ingest run -> SQL row -> answer citation
```
