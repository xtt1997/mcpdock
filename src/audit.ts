import { diffAgainstClient } from "./diff.js";
import { discoverClientConfig } from "./import.js";
import type { ClientId, DockConfig } from "./types.js";

export interface AuditEntry {
  client: ClientId;
  status: "present" | "missing";
  path: string;
  summary: {
    added: number;
    changed: number;
    removed: number;
    unchanged: number;
  };
}

export async function auditClients(
  clients: ClientId[],
  config: DockConfig,
  homeDir?: string,
): Promise<AuditEntry[]> {
  const results: AuditEntry[] = [];

  for (const client of clients) {
    const discovery = await discoverClientConfig(client, homeDir);
    const diff = await diffAgainstClient(client, config, homeDir);
    results.push({
      client,
      status: discovery.status,
      path: discovery.selectedPath,
      summary: diff.summary,
    });
  }

  return results;
}
