import { applyToClient } from "./apply.js";
import type { ClientId, DockConfig } from "./types.js";

export interface SyncEntry {
  client: ClientId;
  targetPath: string;
  backupPath: string | null;
}

export async function syncClients(
  clients: ClientId[],
  config: DockConfig,
  homeDir?: string,
): Promise<SyncEntry[]> {
  const results: SyncEntry[] = [];

  for (const client of clients) {
    const result = await applyToClient(client, config, homeDir);
    results.push({
      client,
      targetPath: result.targetPath,
      backupPath: result.backupPath,
    });
  }

  return results;
}
