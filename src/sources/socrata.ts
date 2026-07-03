export type SocrataQuery = {
  domain?: string;
  datasetId: string;
  select?: string;
  where?: string;
  order?: string;
  limit?: number;
  offset?: number;
  appToken?: string;
};

export function buildSocrataUrl(query: SocrataQuery): URL {
  const domain = query.domain ?? "data.texas.gov";
  const url = new URL(`https://${domain}/resource/${query.datasetId}.json`);

  if (query.select) url.searchParams.set("$select", query.select);
  if (query.where) url.searchParams.set("$where", query.where);
  if (query.order) url.searchParams.set("$order", query.order);
  if (query.limit) url.searchParams.set("$limit", String(query.limit));
  if (query.offset) url.searchParams.set("$offset", String(query.offset));
  if (query.appToken) url.searchParams.set("$$app_token", query.appToken);

  return url;
}

export async function fetchSocrataJson(query: SocrataQuery): Promise<unknown> {
  const response = await fetch(buildSocrataUrl(query));

  if (!response.ok) {
    throw new Error(`Socrata request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
