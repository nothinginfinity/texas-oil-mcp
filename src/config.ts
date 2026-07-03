export type TexasOilConfig = {
  eiaApiKey?: string;
  dbPath: string;
  rawDir: string;
  processedDir: string;
};

export function readConfig(env: NodeJS.ProcessEnv = process.env): TexasOilConfig {
  return {
    eiaApiKey: env.EIA_API_KEY,
    dbPath: env.TEXAS_OIL_DB_PATH ?? "./data/texas-oil.sqlite",
    rawDir: env.TEXAS_OIL_RAW_DIR ?? "./data/raw",
    processedDir: env.TEXAS_OIL_PROCESSED_DIR ?? "./data/processed"
  };
}
