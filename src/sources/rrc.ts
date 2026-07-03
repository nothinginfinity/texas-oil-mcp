import { datasetRegistry } from "./registry.js";

export function listRrcSources() {
  return datasetRegistry.filter((dataset) => dataset.agency.includes("Railroad Commission"));
}

export function assertRrcSourceAllowed(datasetId: string) {
  const dataset = datasetRegistry.find((item) => item.id === datasetId);

  if (!dataset) {
    throw new Error(`Unknown RRC dataset: ${datasetId}`);
  }

  if (!dataset.approvedForAutomation) {
    throw new Error(`Dataset is not approved for automation: ${datasetId}`);
  }

  return dataset;
}

export function buildRrcBulkDownloadNotice(datasetId: string) {
  const dataset = assertRrcSourceAllowed(datasetId);

  return {
    datasetId,
    landingPage: dataset.landingPage,
    instruction: "Download only from official registered bulk/report locations. Preserve raw file and checksum before parsing.",
    nextImplementationStep: "Add exact file URL, layout descriptor, checksum capture, and parser mapping for this dataset."
  };
}
