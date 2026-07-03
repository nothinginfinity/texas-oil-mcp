# Data Sources

## Approved source classes

### RRC bulk downloads

Use official downloadable datasets from the Railroad Commission of Texas data download pages. These may require fixed-width parsing, layout descriptors, checksums, and schema validation.

### RRC official reports

Use official production summaries and monthly reports as reference and validation material.

### EIA API

Use EIA API endpoints for clean statewide and federal comparison series. EIA data should be labeled as estimated or federal-source data, not mixed silently with RRC-reported values.

### Texas Open Data / Socrata

Use Socrata endpoints for structured datasets such as RRC wellbore casing.

### Manual uploads

Allow manually uploaded PDFs, CSV files, downloaded reports, and schema documents when their source is recorded.

## Disallowed source classes

### RRC interactive research queries

Do not automate RRC web query systems. Do not scrape, crawl, session-replay, bypass limits, or build hidden endpoint clients for those systems.

## Source lineage requirements

Each raw source should record:

- agency
- dataset id
- source class
- landing page
- source URL when applicable
- retrieval timestamp
- checksum
- byte size
- ingest run id
- parser/layout version
- confidence class

## Early source registry ids

- `rrc-production-data-query-dump`
- `rrc-statewide-production-data`
- `eia-texas-state-monthly`
- `tx-open-data-rrc-wellbore-casing`
- `rrc-interactive-research-queries`
