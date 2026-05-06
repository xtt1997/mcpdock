import fs from "node:fs/promises";

import type { DockConfig } from "./types.js";

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
