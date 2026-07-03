import { datasetRegistry, findDataset } from "./sources/registry.js";
import { buildIngestPlan } from "./etl/ingest.js";
import { sqlTemplates } from "./db/schema.js";
import { buildChatContext } from "./lib/citations.js";

type AiBinding = {
  run(model: string, input: unknown): Promise<any>;
};

type VectorRecord = {
  id: string;
  values: number[];
  metadata?: Record<string, string | number | boolean | string[]>;
};

type VectorizeBinding = {
  insert(vectors: VectorRecord[]): Promise<unknown>;
  query(vector: number[], options?: Record<string, unknown>): Promise<unknown>;
};

type Env = {
  DB: D1Database;
  RAW_BUCKET: R2Bucket;
  TEXAS_OIL_VECTORIZE: VectorizeBinding;
  AI: AiBinding;
  ADMIN_TOKEN?: string;
  EIA_API_KEY?: string;
  SOURCE_REGISTRY_VERSION?: string;
  VECTOR_EMBEDDING_MODEL?: string;
};

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8"
};

function json(value: JsonValue, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value, null, 2), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {})
    }
  });
}

function notFound(pathname: string) {
  return json({ error: "Not found", pathname }, { status: 404 });
}

function requireAdmin(request: Request, env: Env) {
  if (!env.ADMIN_TOKEN) {
    return json({ error: "ADMIN_TOKEN is not configured on the Worker" }, { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.ADMIN_TOKEN}`;

  if (header !== expected) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

async function readJsonBody<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("Expected application/json request body");
  }

  return request.json() as Promise<T>;
}

async function health(env: Env) {
  let d1Ok = false;
  try {
    await env.DB.prepare("select 1 as ok").first();
    d1Ok = true;
  } catch {
    d1Ok = false;
  }

  return json({
    ok: true,
    service: "texas-oil-mcp-worker",
    sourceRegistryVersion: env.SOURCE_REGISTRY_VERSION ?? "unknown",
    bindings: {
      d1: d1Ok,
      r2: Boolean(env.RAW_BUCKET),
      vectorize: Boolean(env.TEXAS_OIL_VECTORIZE),
      workersAi: Boolean(env.AI),
      adminTokenConfigured: Boolean(env.ADMIN_TOKEN),
      eiaApiKeyConfigured: Boolean(env.EIA_API_KEY)
    }
  });
}

async function listSources(env: Env) {
  try {
    const result = await env.DB.prepare(
      "select id, title, source_class, agency, landing_page, approved_for_automation, confidence_class from source_registry order by id"
    ).all();

    if (result.results.length > 0) {
      return json({ source: "d1", datasets: result.results });
    }
  } catch {
  }

  return json({ source: "static_registry", datasets: datasetRegistry });
}

async function seedSourceRegistry(request: Request, env: Env) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;

  const statements = datasetRegistry.map((dataset) =>
    env.DB.prepare(
      `insert into source_registry (
        id,
        title,
        source_class,
        agency,
        landing_page,
        approved_for_automation,
        expected_refresh,
        confidence_class,
        notes_json,
        updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
      on conflict(id) do update set
        title = excluded.title,
        source_class = excluded.source_class,
        agency = excluded.agency,
        landing_page = excluded.landing_page,
        approved_for_automation = excluded.approved_for_automation,
        expected_refresh = excluded.expected_refresh,
        confidence_class = excluded.confidence_class,
        notes_json = excluded.notes_json,
        updated_at = current_timestamp`
    ).bind(
      dataset.id,
      dataset.title,
      dataset.sourceClass,
      dataset.agency,
      dataset.landingPage,
      dataset.approvedForAutomation ? 1 : 0,
      dataset.expectedRefresh,
      dataset.confidenceClass,
      JSON.stringify(dataset.notes)
    )
  );

  await env.DB.batch(statements);

  return json({ ok: true, seeded: datasetRegistry.length });
}

async function planIngest(request: Request) {
  const body = await readJsonBody<{ datasetId?: string }>(request);
  const datasetId = body.datasetId ?? "";
  const dataset = findDataset(datasetId);

  if (!dataset) {
    return json({ error: "Unknown dataset", knownDatasetIds: datasetRegistry.map((item) => item.id) }, { status: 400 });
  }

  return json(buildIngestPlan(dataset));
}

function getSqlTemplate(url: URL) {
  const template = url.searchParams.get("template") ?? "";
  if (!(template in sqlTemplates)) {
    return json({ error: "Unknown template", templates: Object.keys(sqlTemplates) }, { status: 400 });
  }

  return json({ template, sql: sqlTemplates[template as keyof typeof sqlTemplates] });
}

function getChatContext(request: Request) {
  const url = new URL(request.url);
  const question = url.searchParams.get("question") ?? "";
  const preferredSource = (url.searchParams.get("preferredSource") ?? "mixed") as "rrc" | "eia" | "socrata" | "mixed";

  return json(buildChatContext(question, preferredSource));
}

async function putRawObject(request: Request, env: Env, key: string) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;

  if (!key || key.endsWith("/")) {
    return json({ error: "Missing R2 object key" }, { status: 400 });
  }

  const object = await env.RAW_BUCKET.put(key, request.body, {
    httpMetadata: {
      contentType: request.headers.get("content-type") ?? "application/octet-stream"
    },
    customMetadata: {
      source: "manual_or_pipeline_upload",
      contentLength: request.headers.get("content-length") ?? "unknown"
    }
  });

  return json({ ok: true, key, etag: object?.etag, uploaded: object?.uploaded?.toISOString?.() });
}

async function headRawObject(env: Env, key: string) {
  const object = await env.RAW_BUCKET.head(key);

  if (!object) {
    return json({ exists: false, key }, { status: 404 });
  }

  return json({
    exists: true,
    key,
    size: object.size,
    etag: object.etag,
    uploaded: object.uploaded.toISOString(),
    customMetadata: object.customMetadata
  });
}

function extractEmbedding(result: any): number[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data?.[0])) return result.data[0];
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.result?.data?.[0])) return result.result.data[0];

  throw new Error("Unable to extract embedding vector from Workers AI response");
}

async function embedText(env: Env, text: string) {
  const model = env.VECTOR_EMBEDDING_MODEL ?? "@cf/baai/bge-base-en-v1.5";
  const result = await env.AI.run(model, { text });
  return extractEmbedding(result);
}

async function vectorizeUpsert(request: Request, env: Env) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;

  const body = await readJsonBody<{
    id?: string;
    text?: string;
    metadata?: Record<string, string | number | boolean | string[]>;
  }>(request);

  if (!body.text) {
    return json({ error: "Missing text" }, { status: 400 });
  }

  const id = body.id ?? crypto.randomUUID();
  const values = await embedText(env, body.text);
  const metadata = {
    kind: "texas_oil_chunk",
    textPreview: body.text.slice(0, 256),
    ...(body.metadata ?? {})
  };

  const inserted = await env.TEXAS_OIL_VECTORIZE.insert([
    {
      id,
      values,
      metadata
    }
  ]);

  return json({ ok: true, id, dimensions: values.length, inserted });
}

async function vectorizeQuery(request: Request, env: Env) {
  const body = await readJsonBody<{ text?: string; topK?: number }>(request);

  if (!body.text) {
    return json({ error: "Missing text" }, { status: 400 });
  }

  const values = await embedText(env, body.text);
  const matches = await env.TEXAS_OIL_VECTORIZE.query(values, {
    topK: Math.min(Math.max(body.topK ?? 5, 1), 20),
    returnMetadata: true
  });

  return json({ ok: true, dimensions: values.length, matches });
}

async function route(request: Request, env: Env) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === "GET" && pathname === "/health") return health(env);
  if (request.method === "GET" && pathname === "/api/sources") return listSources(env);
  if (request.method === "POST" && pathname === "/api/admin/seed-sources") return seedSourceRegistry(request, env);
  if (request.method === "POST" && pathname === "/api/ingest/plan") return planIngest(request);
  if (request.method === "GET" && pathname === "/api/sql-template") return getSqlTemplate(url);
  if (request.method === "GET" && pathname === "/api/chat-context") return getChatContext(request);
  if (request.method === "POST" && pathname === "/api/vectorize/upsert") return vectorizeUpsert(request, env);
  if (request.method === "POST" && pathname === "/api/vectorize/query") return vectorizeQuery(request, env);

  if (pathname.startsWith("/api/raw/")) {
    const key = decodeURIComponent(pathname.replace("/api/raw/", ""));
    if (request.method === "PUT") return putRawObject(request, env, key);
    if (request.method === "HEAD" || request.method === "GET") return headRawObject(env, key);
  }

  return notFound(pathname);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
  },

  async scheduled(_event: unknown, env: Env): Promise<void> {
    await env.DB.prepare(
      "insert into query_logs (id, question, selected_sources_json, answer_text) values (?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(),
      "scheduled-health-check",
      JSON.stringify({ source: "cloudflare_scheduled" }),
      "scheduled hook reached texas-oil-mcp worker"
    ).run();
  }
};
