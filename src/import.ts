import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { ClientConfigDiscovery, ClientId, DockConfig } from "./types.js";

const clientPathTemplates: Record<ClientId, string[]> = {
  codex: [
    ".codex/config.json",
    "Library/Application Support/Codex/config.json",
  ],
  "claude-desktop": [
    "Library/Application Support/Claude/claude_desktop_config.json",
    "Library/Application Support/Claude-3p/claude_desktop_config.json",
  ],
  cursor: [
    ".cursor/mcp.json",
    "Library/Application Support/Cursor/mcp.json",
  ],
};

function expandCandidates(homeDir: string, client: ClientId): string[] {
  return clientPathTemplates[client].map((value) => path.join(homeDir, value));
}

export async function discoverClientConfig(
  client: ClientId,
  homeDir = os.homedir(),
): Promise<ClientConfigDiscovery> {
  const candidatePaths = expandCandidates(homeDir, client);

  for (const candidate of candidatePaths) {
    try {
      await fs.access(candidate);
      return {
        client,
        selectedPath: candidate,
        candidatePaths,
        status: "present",
      };
    } catch {
      // keep checking
    }
  }

  return {
    client,
    selectedPath: candidatePaths[0],
    candidatePaths,
    status: "missing",
  };
}

export async function importClientConfig(
  clientConfigPath: string,
  config: DockConfig,
): Promise<DockConfig> {
  const raw = await fs.readFile(clientConfigPath, "utf8");
  const parsed = JSON.parse(raw) as {
    mcpServers?: Record<
      string,
      {
        command: string;
        args?: string[];
        env?: Record<string, string>;
      }
    >;
  };

  const importedServers = Object.entries(parsed.mcpServers ?? {}).map(
    ([name, value]) => ({
      name,
      template: "imported",
      command: value.command,
      args: value.args ?? [],
      env: value.env ?? {},
    }),
  );

  const retained = config.servers.filter(
    (server) => !importedServers.some((incoming) => incoming.name === server.name),
  );

  return {
    servers: [...retained, ...importedServers],
  };
}

export async function importFromClient(
  client: ClientId,
  config: DockConfig,
  homeDir = os.homedir(),
): Promise<DockConfig> {
  const discovery = await discoverClientConfig(client, homeDir);
  if (discovery.status === "missing") {
    throw new Error(`could not find a ${client} config file`);
  }

  return importClientConfig(discovery.selectedPath, config);
}
