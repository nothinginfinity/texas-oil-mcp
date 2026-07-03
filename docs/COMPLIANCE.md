# Compliance Notes

## Principle

This repo is a compliant data-ingestion system, not a scraper.

## Hard bans

The project must not include code that:

- automates RRC interactive research query sessions
- bypasses bot controls, CAPTCHA, rate limits, or session restrictions
- reverse-engineers hidden interactive endpoints for bulk extraction
- blends commercial/licensed data into public-source tables without license-aware lineage

## Allowed paths

The project may use:

- official public bulk downloads
- official published reports
- government APIs
- Texas Open Data / Socrata APIs
- manual uploads with source attribution
- commercial APIs only with valid credentials and separate lineage labels

## Answering rules

Every analyst answer should identify:

- metric
- period
- geography/entity
- source agency
- dataset
- confidence class
- whether data is RRC-reported, EIA-estimated, or another source class

## RRC vs EIA

Do not treat EIA Texas production values as identical to RRC reported production values. They may use different methods, timing, revisions, and aggregation rules.

## Lease vs well-level production

Do not imply well-level oil production when the underlying source reports oil production by lease. If a lease contains multiple wells, describe the limitation clearly.
