# Roadmap

## Phase 0 — Repo scaffold

Status: complete in initial scaffold.

Deliverables:

- create repo
- add TypeScript MCP server skeleton
- add source registry
- add SQL schema
- add compliance notes
- add data-source docs
- add roadmap

Exit criteria:

- repo builds with TypeScript
- MCP server starts locally
- tools return deterministic scaffold responses

## Phase 1 — Source registry and compliance gate

Objective: make the MCP aware of approved and disallowed source classes.

Deliverables:

- durable source registry table
- approved source type enum
- disallowed source class enum
- `rrc_list_datasets` reads from registry
- `rrc_plan_ingest` refuses interactive web-query sources
- source lineage model for every downstream answer

Approved sources:

- RRC bulk downloadable datasets
- RRC official published reports
- EIA API endpoints
- Texas Open Data / Socrata datasets
- manually uploaded documents

Disallowed sources:

- automated RRC research query sessions
- CAPTCHA or anti-bot bypass
- hidden/private endpoints
- commercial APIs without credentials and license

Exit criteria:

- every ingest plan includes source class, confidence class, and compliance note

## Phase 2 — EIA connector

Objective: ship the first real API-backed data path.

Deliverables:

- EIA API key config
- Texas statewide crude monthly fetcher
- Texas natural gas monthly fetcher
- EIA raw response cache
- `eia_state_monthly` loader
- comparison notes explaining EIA estimates vs RRC reported values

Exit criteria:

- MCP can answer statewide monthly trend questions from EIA data
- answers cite EIA series metadata and fetch timestamp

## Phase 3 — RRC production bulk ingest MVP

Objective: parse one official RRC production bulk dataset into normalized tables.

Deliverables:

- raw file downloader for registered RRC bulk links
- R2/local raw archive writer
- checksum and source file manifest
- fixed-width layout descriptor
- parser validation report
- `production_monthly` loader
- county/month summary table

Exit criteria:

- can query monthly oil/gas production by county and statewide total
- ingest run is reproducible from source file manifest
- no interactive RRC query automation exists in codebase

## Phase 4 — Wellbore and casing connector

Objective: attach structured well context from Texas Open Data.

Deliverables:

- Socrata API connector
- `wellbores` loader
- casing dataset loader
- pagination support
- schema drift detection
- link wellbore records to leases when identifiers align

Exit criteria:

- MCP can answer wellbore/casing lookup questions with source citations

## Phase 5 — Operator, lease, field, and district normalization

Objective: make the database useful for oil-and-gas analyst workflows.

Deliverables:

- operator normalization
- lease normalization
- field normalization
- district normalization
- alias tables
- FTS indexes for names
- entity profile tool

Exit criteria:

- MCP can generate operator, lease, field, county, and district profiles

## Phase 6 — RAG layer

Objective: add natural-language explanation over reports, schemas, FAQs, and generated monthly summaries.

Deliverables:

- document registry
- chunker
- embedding abstraction
- Vectorize-ready output adapter
- cited answer builder
- answer citation table
- data quality flags

Exit criteria:

- MCP can answer “why” and “how is this calculated” questions with citations

## Phase 7 — Texas Oil Analyst Chat

Objective: expose a serious domain-specific chat interface.

Deliverables:

- `ask_texas_oil` tool
- query planner
- SQL execution adapter
- citation assembly
- confidence labels
- analyst report generator
- saved query logs

Example questions:

- Which Texas counties had the largest oil-production increases over the last year?
- Compare Midland, Martin, Reeves, and Loving County over the last 24 months.
- Why do EIA Texas numbers differ from RRC reported production?
- Which operators are rising fastest in District 8?
- Create a Permian Texas monthly briefing.

Exit criteria:

- every answer contains source lineage, period, metric, and confidence status

## Phase 8 — Cloudflare-native deployment

Objective: convert the data system into a deployed AFO-compatible platform.

Deliverables:

- R2 raw archive bucket config
- D1 migrations
- Worker query API
- Vectorize index config
- scheduled ingestion jobs
- admin source registry UI
- AFO/CairnStone orientation stone

Exit criteria:

- deployed Worker can serve query endpoints
- scheduled ingest can update approved sources
- latest canonical architecture is documented

## Phase 9 — Commercial/vendor connector layer

Objective: optionally integrate licensed commercial APIs.

Deliverables:

- vendor credential abstraction
- vendor source registry type
- license notes per connector
- Enverus/WellDatabase/TGS adapter interfaces
- vendor/raw lineage separation

Exit criteria:

- licensed data never contaminates public-source tables without lineage labels

## Non-negotiables

- No scraping banned RRC interactive query systems.
- Every fact returned by chat must trace back to source and ingest run.
- RRC-reported and EIA-estimated data must not be blended without labels.
- Preliminary, revised, and substantially complete production periods must be labeled.
- Raw files must be preserved before transformation.
- Parser assumptions must be documented as layout specs.
