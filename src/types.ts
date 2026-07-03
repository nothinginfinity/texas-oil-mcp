export type SourceClass =
  | "rrc_bulk_download"
  | "rrc_official_report"
  | "eia_api"
  | "texas_open_data_socrata"
  | "manual_upload"
  | "disallowed_interactive_query";

export type ConfidenceClass =
  | "reported_preliminary"
  | "reported_revised"
  | "substantially_complete"
  | "eia_estimated"
  | "official_reference"
  | "unknown";

export type TexasOilDataset = {
  id: string;
  title: string;
  sourceClass: SourceClass;
  agency: string;
  landingPage: string;
  description: string;
  approvedForAutomation: boolean;
  expectedRefresh: string;
  confidenceClass: ConfidenceClass;
  notes: string[];
};

export type IngestPlan = {
  datasetId: string;
  approved: boolean;
  sourceClass: SourceClass;
  steps: string[];
  blockedReason?: string;
  lineageFields: string[];
};

export type Citation = {
  agency: string;
  dataset: string;
  sourceUrl?: string;
  sourceFileId?: string;
  ingestRunId?: string;
  period?: string;
  confidenceClass: ConfidenceClass;
};
