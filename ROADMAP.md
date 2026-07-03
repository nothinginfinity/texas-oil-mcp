# Roadmap

## Phase 0 — Repo scaffold

Status: complete.

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

Status: mostly complete.

Objective: make the MCP aware of approved and disallowed source classes.

Deliverables:

- durable source registry table
- approved source type enum
- disallowed source class enum
- `rrc_list_datasets` reads from registry
- `rrc_plan_ingest` refuses interactive web-query sources
- source lineage model for every downstream answer
- Cloudflare Worker endpoint for source listing
- admin endpoint to seed D1 source registry

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
- D1 source registry can be seeded through protected Worker endpoint

## Phase 2 — Cloudflare deployment foundation

Status: scaffolded.

Objective: make the repo deployable on Cloudflare Workers with D1, R2, Vectorize, and Workers AI bindings.

Deliverables:

- `wrangler.toml`
- D1 binding: `DB`
- R2 binding: `RAW_BUCKET`
- Vectorize binding: `TEXAS_OIL_VECTORIZE`
- Workers AI binding: `AI`
- deploy workflow
- bootstrap scripts
- smoke test script
- Cloudflare setup docs
- Vectorize plan docs

Manual setup required:

- create D1 database and replace `REPLACE_WITH_D1_DATABASE_ID`
- create R2 bucket
- create Vectorize index and metadata indexes
- set Worker `ADMIN_TOKEN`
- optionally set Worker `EIA_API_KEY`
- set GitHub `CLOUDFLARE_API_TOKEN`
- set GitHub `CLOUDFLARE_ACCOUNT_ID`

Exit criteria:

- `npm run check` passes
- `npm run build` passes
- `npm run check:wrangler` passes after D1 id is set
- deployed `/health` shows D1, R2, Vectorize, and AI bindings present

## Phase 3 — EIA connector

Objective: ship the first real API-backed data path.

Deliverables:

- EIA API key config
- Texas statewide crude monthly fetcher
- Texas natural gas monthly fetcher
- EIA raw response cache in R2
- `eia_state_monthly` loader
- comparison notes explaining EIA estimates vs RRC reported values

Exit criteria:

- MCP can answer statewide monthly trend questions from EIA data
- answers cite EIA series metadata and fetch timestamp

## Phase 4 — RRC production bulk ingest MVP

Objective: parse one official RRC production bulk dataset into normalized tables.

Deliverables:

- raw file downloader for registered RRC bulk links
- R2 raw archive writer
- checksum and source file manifest
- fixed-width layout descriptor
- parser validation report
- `production_monthly` loader
- county/month summary table

Exit criteria:

- can query monthly oil/gas production by county and statewide total
- ingest run is reproducible from source file manifest
- no interactive RRC query automation exists in codebase

## Phase 5 — Wellbore and casing connector

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

## Phase 6 — Operator, lease, field, and district normalization

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

## Phase 7 — RAG layer

Objective: add natural-language explanation over reports, schemas, FAQs, and generated monthly summaries.

Deliverables:

- document registry
- chunker
- embedding abstraction
- Vectorize-ready output adapter
- cited answer builder
- answer citation table
- data quality flags
- `/api/vectorize/upsert`
- `/api/vectorize/query`

Exit criteria:

- MCP can answer “why” and “how is this calculated” questions with citations

## Phase 8 — Texas Oil Analyst Chat

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

## Phase 9 — Cloudflare-native scheduled ingestion

Objective: convert approved source updates into scheduled AFO-compatible ingestion jobs.

Deliverables:

- scheduled source checks
- ingest receipts in D1
- R2 raw object manifests
- data quality dashboards
- alerting/report hooks
- CairnStone orientation stone after meaningful releases

Exit criteria:

- scheduled ingest can update approved sources
- latest canonical architecture is documented

## Phase 10 — Commercial/vendor connector layer

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
