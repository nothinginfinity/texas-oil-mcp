export function buildChatContext(question: string, preferredSource: "rrc" | "eia" | "socrata" | "mixed") {
  return {
    question,
    preferredSource,
    analystRules: [
      "Prefer RRC bulk/report data for lease, county, district, field, operator, and reported production questions.",
      "Prefer EIA for clean statewide or federal comparison questions.",
      "Prefer Socrata for structured wellbore/casing context.",
      "Do not imply well-level oil production when the source is lease-level production.",
      "Separate RRC-reported and EIA-estimated values.",
      "Attach source lineage and confidence labels to every numeric answer."
    ],
    requiredCitationFields: [
      "agency",
      "dataset_id",
      "source_url_or_file_id",
      "ingest_run_id",
      "period",
      "confidence_class"
    ],
    nextStep: "When SQL execution is wired, use the question to plan source selection, query templates, and citation assembly."
  };
}
