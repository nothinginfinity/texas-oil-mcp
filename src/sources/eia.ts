export type EiaFetchOptions = {
  apiKey?: string;
  route: string;
  frequency?: string;
  data?: string[];
  facets?: Record<string, string[]>;
  start?: string;
  end?: string;
};

export function buildEiaUrl(options: EiaFetchOptions): URL {
  const url = new URL(`https://api.eia.gov/v2/${options.route.replace(/^\//, "")}`);

  if (options.apiKey) url.searchParams.set("api_key", options.apiKey);
  if (options.frequency) url.searchParams.set("frequency", options.frequency);
  if (options.start) url.searchParams.set("start", options.start);
  if (options.end) url.searchParams.set("end", options.end);

  for (const dataKey of options.data ?? []) {
    url.searchParams.append("data[]", dataKey);
  }

  for (const [facetName, facetValues] of Object.entries(options.facets ?? {})) {
    for (const facetValue of facetValues) {
      url.searchParams.append(`facets[${facetName}][]`, facetValue);
    }
  }

  return url;
}

export async function fetchEiaJson(options: EiaFetchOptions): Promise<unknown> {
  const response = await fetch(buildEiaUrl(options));

  if (!response.ok) {
    throw new Error(`EIA request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
