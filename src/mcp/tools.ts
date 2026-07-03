import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { datasetRegistry, findDataset } from "../sources/registry.js";
import { buildIngestPlan } from "../etl/ingest.js";
import { sqlTemplates } from "../db/schema.js";
import { buildChatContext } from "../lib/citations.js";

function textResponse(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function registerTexasOilTools(server: McpServer) {
  server.registerTool(
    "rrc_list_datasets",
    {
      title: "List Texas Oil Data Sources",
      description: "List approved and disallowed Texas oil/gas data sources with compliance notes.",
      inputSchema: {
        includeDisallowed: z.boolean().default(false)
      }
    },
    async ({ includeDisallowed }) => {
      const datasets = datasetRegistry.filter((dataset) => includeDisallowed || dataset.approvedForAutomation);
      return textResponse({ datasets });
    }
  );

  server.registerTool(
    "rrc_plan_ingest",
    {
      title: "Plan Texas Oil Data Ingest",
      description: "Return a compliant ingest plan for a registered dataset. Disallowed sources are blocked by design.",
      inputSchema: {
        datasetId: z.string()
      }
    },
    async ({ datasetId }) => {
      const dataset = findDataset(datasetId);
      if (!dataset) {
        return textResponse({ error: "Unknown dataset", knownDatasetIds: datasetRegistry.map((item) => item.id) });
      }

      return textResponse(buildIngestPlan(dataset));
    }
  );

  server.registerTool(
    "texas_oil_sql_template",
    {
      title: "Get Texas Oil SQL Template",
      description: "Return starter SQL templates for Texas oil analyst questions.",
      inputSchema: {
        template: z.enum([
          "countyMonthlyProduction",
          "statewideMonthlyProduction",
          "operatorProfile",
          "sourceLineage",
          "eiaRrcComparison"
        ])
      }
    },
    async ({ template }) => textResponse(sqlTemplates[template])
  );

  server.registerTool(
    "texas_oil_confidence_guide",
    {
      title: "Texas Oil Confidence Guide",
      description: "Explain confidence labels used by the Texas oil data system.",
      inputSchema: {}
    },
    async () => textResponse({
      labels: {
        reported_preliminary: "RRC-reported value that may still change as late, corrected, or revised reports arrive.",
        reported_revised: "RRC-reported value after revisions have entered the public source files.",
        substantially_complete: "Older RRC-reported production period that should be relatively stable, while still preserving source lineage.",
        eia_estimated: "EIA estimate or API value. Keep separate from RRC-reported figures.",
        official_reference: "Official reference document, dataset, or structured portal record that explains entities or context.",
        unknown: "The system does not yet know the confidence class. Do not use for final analyst answers without review."
      },
      rule: "Never blend EIA-estimated and RRC-reported values without labeling both sides."
    })
  );

  server.registerTool(
    "texas_oil_chat_context",
    {
      title: "Build Texas Oil Chat Context",
      description: "Return a safe analyst context block for a natural-language Texas oil question.",
      inputSchema: {
        question: z.string(),
        preferredSource: z.enum(["rrc", "eia", "socrata", "mixed"]).default("mixed")
      }
    },
    async ({ question, preferredSource }) => textResponse(buildChatContext(question, preferredSource))
  );
}
