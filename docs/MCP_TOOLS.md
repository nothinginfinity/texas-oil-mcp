# MCP Tools

## Current scaffold tools

### `rrc_list_datasets`

Lists approved data sources and, optionally, disallowed source classes.

Input:

```json
{
  "includeDisallowed": false
}
```

### `rrc_plan_ingest`

Creates a compliant ingest plan for a dataset id.

Input:

```json
{
  "datasetId": "rrc-production-data-query-dump"
}
```

### `texas_oil_sql_template`

Returns SQL templates for common analyst questions.

Input:

```json
{
  "template": "countyMonthlyProduction"
}
```

Templates:

- `countyMonthlyProduction`
- `statewideMonthlyProduction`
- `operatorProfile`
- `sourceLineage`
- `eiaRrcComparison`

### `texas_oil_confidence_guide`

Explains confidence labels.

### `texas_oil_chat_context`

Builds a safe analysis context for a natural-language question.

Input:

```json
{
  "question": "Which counties had the largest oil production increase last year?",
  "preferredSource": "mixed"
}
```

## Planned tools

### Ingestion

- `rrc_download_bulk_file`
- `rrc_ingest_production_dump`
- `rrc_ingest_monthly_ledger`
- `eia_ingest_state_monthly`
- `socrata_ingest_wellbore_casing`

### Query

- `query_texas_oil`
- `query_operator_profile`
- `query_lease_profile`
- `query_county_rankings`
- `compare_rrc_eia`

### Chat and reports

- `ask_texas_oil`
- `generate_county_report`
- `generate_operator_report`
- `generate_permian_briefing`
- `explain_data_lineage`
