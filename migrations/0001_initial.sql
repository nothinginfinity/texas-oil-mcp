create table if not exists source_registry (
  id text primary key,
  title text not null,
  source_class text not null,
  agency text not null,
  landing_page text not null,
  approved_for_automation integer not null,
  expected_refresh text not null,
  confidence_class text not null,
  notes_json text not null,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists ingest_runs (
  id text primary key,
  dataset_id text not null references source_registry(id),
  status text not null,
  started_at text not null default current_timestamp,
  completed_at text,
  error_message text,
  parser_version text,
  metadata_json text not null default '{}'
);

create table if not exists source_files (
  id text primary key,
  ingest_run_id text references ingest_runs(id),
  dataset_id text not null references source_registry(id),
  agency text not null,
  source_url text,
  storage_uri text,
  checksum_sha256 text,
  byte_size integer,
  content_type text,
  retrieved_at text not null default current_timestamp,
  metadata_json text not null default '{}'
);

create table if not exists operators (
  id text primary key,
  operator_number text,
  operator_name text not null,
  normalized_name text not null,
  source_file_id text references source_files(id),
  created_at text not null default current_timestamp
);

create table if not exists counties (
  id text primary key,
  county_name text not null unique,
  county_number text,
  created_at text not null default current_timestamp
);

create table if not exists districts (
  id text primary key,
  district_code text not null unique,
  district_name text,
  created_at text not null default current_timestamp
);

create table if not exists fields (
  id text primary key,
  field_number text,
  field_name text not null,
  district_code text,
  created_at text not null default current_timestamp
);

create table if not exists leases (
  id text primary key,
  lease_number text,
  lease_name text,
  lease_type text,
  operator_id text references operators(id),
  county_id text references counties(id),
  district_id text references districts(id),
  field_id text references fields(id),
  source_file_id text references source_files(id),
  created_at text not null default current_timestamp
);

create table if not exists wellbores (
  id text primary key,
  api_number text,
  wellbore_id text,
  lease_id text references leases(id),
  operator_id text references operators(id),
  county_id text references counties(id),
  district_id text references districts(id),
  field_id text references fields(id),
  well_name text,
  well_number text,
  status text,
  source_file_id text references source_files(id),
  raw_json text,
  created_at text not null default current_timestamp
);

create table if not exists production_monthly (
  id text primary key,
  production_month text not null,
  lease_id text references leases(id),
  operator_id text references operators(id),
  county_id text references counties(id),
  district_id text references districts(id),
  field_id text references fields(id),
  lease_number text,
  lease_name text,
  operator_name text,
  county_name text,
  district_code text,
  field_name text,
  oil_bbl real not null default 0,
  gas_mcf real not null default 0,
  condensate_bbl real not null default 0,
  casinghead_mcf real not null default 0,
  source_file_id text not null references source_files(id),
  ingest_run_id text not null references ingest_runs(id),
  confidence_class text not null,
  raw_record_hash text,
  created_at text not null default current_timestamp
);

create index if not exists idx_production_monthly_month on production_monthly(production_month);
create index if not exists idx_production_monthly_county_month on production_monthly(county_name, production_month);
create index if not exists idx_production_monthly_operator_month on production_monthly(operator_name, production_month);
create index if not exists idx_production_monthly_lease_month on production_monthly(lease_number, production_month);
create index if not exists idx_production_monthly_field_month on production_monthly(field_name, production_month);

create table if not exists eia_state_monthly (
  id text primary key,
  production_month text not null,
  state_code text not null,
  state_name text not null,
  oil_bbl real,
  gas_mcf real,
  series_id text,
  unit text,
  source_file_id text references source_files(id),
  ingest_run_id text references ingest_runs(id),
  confidence_class text not null default 'eia_estimated',
  created_at text not null default current_timestamp
);

create index if not exists idx_eia_state_monthly_month on eia_state_monthly(production_month);

create table if not exists documents (
  id text primary key,
  source_file_id text references source_files(id),
  title text not null,
  document_type text not null,
  text_content text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp
);

create table if not exists document_chunks (
  id text primary key,
  document_id text not null references documents(id),
  chunk_index integer not null,
  chunk_text text not null,
  embedding_id text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp
);

create table if not exists query_logs (
  id text primary key,
  question text not null,
  selected_sources_json text not null,
  sql_json text,
  answer_text text,
  created_at text not null default current_timestamp
);

create table if not exists answer_citations (
  id text primary key,
  answer_id text not null references query_logs(id),
  position integer not null,
  claim_text text not null,
  source_file_id text references source_files(id),
  dataset_id text,
  period text,
  confidence_class text not null,
  created_at text not null default current_timestamp
);
