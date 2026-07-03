import type { IngestPlan, TexasOilDataset } from "../types.js";

export function buildIngestPlan(dataset: TexasOilDataset): IngestPlan {
  if (!dataset.approvedForAutomation) {
    return {
      datasetId: dataset.id,
      approved: false,
      sourceClass: dataset.sourceClass,
      blockedReason: "This source is not approved for automation. Use official bulk downloads, APIs, or manually registered files instead.",
      steps: [
        "Refuse automated access.",
        "Suggest approved source alternatives from the registry.",
        "Log the refusal if this is part of an agent workflow."
      ],
      lineageFields: [
        "dataset_id",
        "source_class",
        "blocked_reason",
        "decision_timestamp"
      ]
    };
  }

  const commonSteps = [
    "Create ingest_run record.",
    "Record source agency, dataset id, landing page, and source class.",
    "Fetch or import only approved public/API/manual source material.",
    "Preserve raw payload or file before transformation.",
    "Compute checksum and byte size.",
    "Validate parser assumptions.",
    "Load normalized tables.",
    "Create summary indexes.",
    "Attach citations and confidence labels."
  ];

  return {
    datasetId: dataset.id,
    approved: true,
    sourceClass: dataset.sourceClass,
    steps: commonSteps,
    lineageFields: [
      "agency",
      "dataset_id",
      "source_class",
      "source_url",
      "source_file_id",
      "ingest_run_id",
      "checksum_sha256",
      "period",
      "confidence_class"
    ]
  };
}
