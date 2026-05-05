import fs from "node:fs/promises";

import type { DockConfig, DockServer } from "./types.js";

export async function loadConfig(configPath: string): Promise<DockConfig> {
  try {
    const raw = await fs.readFile(configPath, "utf8");
    return JSON.parse(raw) as DockConfig;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { servers: [] };
    }
    throw error;
  }
}

export async function saveConfig(
  configPath: string,
  config: DockConfig,
): Promise<void> {
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function addServer(
  config: DockConfig,
  server: DockServer,
): DockConfig {
  return {
    servers: [...config.servers.filter((item) => item.name !== server.name), server],
  };
}
