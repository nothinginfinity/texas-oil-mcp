# Vectorize Plan

## Purpose

Vectorize is for semantic retrieval over Texas oil knowledge, not for primary numeric storage.

Use Vectorize for:

- RRC report text
- schema notes
- parser layout explanations
- monthly generated summaries
- county/operator/field briefing chunks
- source lineage explanations
- compliance notes

Use D1 or a heavier SQL engine for:

- production volumes
- operator rankings
- county/month rollups
- lease/month records
- EIA/RRC comparisons

Use R2 for:

- raw fixed-width files
- raw CSV/JSON responses
- downloaded reports
- parser receipts
- large processed artifacts

## Index configuration

Initial index:

```text
name: texas-oil-vectorize
dimensions: 768
metric: cosine
embedding model: @cf/baai/bge-base-en-v1.5
```

## Metadata fields

Create metadata indexes for:

- `kind`
- `datasetId`
- `agency`
- `period`

Recommended chunk metadata:

```json
{
  "kind": "rrc_report_chunk",
  "datasetId": "rrc-statewide-production-data",
  "agency": "Railroad Commission of Texas",
  "period": "2026-05",
  "sourceFileId": "...",
  "ingestRunId": "...",
  "confidenceClass": "official_reference"
}
```

## First live workflow

1. Seed D1 source registry.
2. Upload a small RRC report or schema note to R2.
3. Insert a short text chunk into Vectorize.
4. Query Vectorize from `/api/vectorize/query`.
5. Use returned metadata to assemble source citations.

## Guardrail

Numeric answers must be SQL-backed. Vectorize can retrieve context for explanation, but it should not be treated as the authoritative store for production volumes.
