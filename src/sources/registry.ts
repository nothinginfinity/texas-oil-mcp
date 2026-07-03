import type { TexasOilDataset } from "../types.js";

export const datasetRegistry: TexasOilDataset[] = [
  {
    id: "rrc-production-data-query-dump",
    title: "RRC Production Data Query Dump",
    sourceClass: "rrc_bulk_download",
    agency: "Railroad Commission of Texas",
    landingPage: "https://www.rrc.texas.gov/resource-center/research/data-sets-available-for-download/",
    description: "Official RRC bulk production dataset. Intended for download-and-parse workflows rather than interactive query automation.",
    approvedForAutomation: true,
    expectedRefresh: "periodic_official_bulk_update",
    confidenceClass: "reported_revised",
    notes: [
      "Use official downloadable files only.",
      "Preserve raw files and checksums before transformation.",
      "Do not automate RRC interactive research query pages."
    ]
  },
  {
    id: "rrc-statewide-production-data",
    title: "RRC Statewide Production Data",
    sourceClass: "rrc_official_report",
    agency: "Railroad Commission of Texas",
    landingPage: "https://www.rrc.texas.gov/oil-and-gas/research-and-statistics/production-data/",
    description: "Official production summaries and monthly reports published by RRC.",
    approvedForAutomation: true,
    expectedRefresh: "monthly_or_periodic_report_update",
    confidenceClass: "official_reference",
    notes: [
      "Useful for summary validation and official report citation.",
      "May differ from raw production-dump totals depending on reporting window and revisions."
    ]
  },
  {
    id: "eia-texas-state-monthly",
    title: "EIA Texas Monthly State Production",
    sourceClass: "eia_api",
    agency: "U.S. Energy Information Administration",
    landingPage: "https://www.eia.gov/opendata/",
    description: "API-backed state-level production series useful for clean statewide trend baselines.",
    approvedForAutomation: true,
    expectedRefresh: "api_refresh",
    confidenceClass: "eia_estimated",
    notes: [
      "Keep EIA-estimated values separate from RRC-reported values.",
      "Use for statewide and regional comparison, not as a substitute for RRC lease-level reporting."
    ]
  },
  {
    id: "tx-open-data-rrc-wellbore-casing",
    title: "Texas Open Data RRC Wellbore Casing",
    sourceClass: "texas_open_data_socrata",
    agency: "Railroad Commission of Texas / Texas Open Data Portal",
    landingPage: "https://data.texas.gov/dataset/RRC-Wellbore-Casing/u9m4-xnh6",
    description: "Structured Socrata dataset for wellbore casing records.",
    approvedForAutomation: true,
    expectedRefresh: "socrata_dataset_refresh",
    confidenceClass: "official_reference",
    notes: [
      "Use Socrata API pagination and app tokens when available.",
      "Schema drift should be checked during ingest."
    ]
  },
  {
    id: "rrc-interactive-research-queries",
    title: "RRC Interactive Research Query Systems",
    sourceClass: "disallowed_interactive_query",
    agency: "Railroad Commission of Texas",
    landingPage: "https://www.rrc.texas.gov/resource-center/research/research-queries/",
    description: "Interactive web query systems intended for individual lookup, not automated bulk retrieval.",
    approvedForAutomation: false,
    expectedRefresh: "not_applicable",
    confidenceClass: "unknown",
    notes: [
      "Do not scrape, crawl, automate sessions, or bypass limits.",
      "Use official bulk files and published reports instead."
    ]
  }
];

export function findDataset(datasetId: string): TexasOilDataset | undefined {
  return datasetRegistry.find((dataset) => dataset.id === datasetId);
}
