export const sqlTemplates = {
  countyMonthlyProduction: `
select
  county_name,
  production_month,
  sum(oil_bbl) as oil_bbl,
  sum(gas_mcf) as gas_mcf,
  confidence_class
from production_monthly
where county_name = :county_name
  and production_month between :start_month and :end_month
group by county_name, production_month, confidence_class
order by production_month;
`,
  statewideMonthlyProduction: `
select
  production_month,
  sum(oil_bbl) as oil_bbl,
  sum(gas_mcf) as gas_mcf,
  confidence_class
from production_monthly
where production_month between :start_month and :end_month
group by production_month, confidence_class
order by production_month;
`,
  operatorProfile: `
select
  operator_name,
  production_month,
  sum(oil_bbl) as oil_bbl,
  sum(gas_mcf) as gas_mcf,
  count(distinct lease_id) as lease_count
from production_monthly
where operator_name like :operator_name
  and production_month between :start_month and :end_month
group by operator_name, production_month
order by production_month;
`,
  sourceLineage: `
select
  ac.answer_id,
  ac.claim_text,
  sf.agency,
  sf.dataset_id,
  sf.source_url,
  sf.checksum_sha256,
  ir.started_at,
  ir.completed_at
from answer_citations ac
join source_files sf on sf.id = ac.source_file_id
left join ingest_runs ir on ir.id = sf.ingest_run_id
where ac.answer_id = :answer_id
order by ac.position;
`,
  eiaRrcComparison: `
select
  r.production_month,
  r.rrc_oil_bbl,
  e.eia_oil_bbl,
  e.eia_oil_bbl - r.rrc_oil_bbl as delta_oil_bbl
from (
  select production_month, sum(oil_bbl) as rrc_oil_bbl
  from production_monthly
  group by production_month
) r
join eia_state_monthly e on e.production_month = r.production_month
where r.production_month between :start_month and :end_month
order by r.production_month;
`
};

export const schemaNotice = "See migrations/0001_initial.sql for the executable D1/SQLite-compatible schema.";
