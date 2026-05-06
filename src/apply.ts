import fs from "node:fs/promises";
import path from "node:path";

import { exportForTarget } from "./export.js";
import { discoverClientConfig } from "./import.js";
import type { ClientId, DockConfig } from "./types.js";

export async function applyToClient(
  target: ClientId,
  config: DockConfig,
  homeDir?: string,
): Promise<{ targetPath: string; backupPath: string | null }> {
  const discovery = await discoverClientConfig(target, homeDir);
  const targetPath = discovery.selectedPath;
  const rendered = exportForTarget(config, target) as { mcpServers: Record<string, unknown> };

  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  let backupPath: string | null = null;
  let existing: Record<string, unknown> = {};
  try {
    await fs.access(targetPath);
    backupPath = `${targetPath}.bak`;
    await fs.copyFile(targetPath, backupPath);
    existing = JSON.parse(await fs.readFile(targetPath, "utf8")) as Record<string, unknown>;
  } catch {
    backupPath = null;
    existing = {};
  }

  const nextConfig = {
    ...existing,
    mcpServers: {
      ...((existing.mcpServers as Record<string, unknown> | undefined) ?? {}),
      ...rendered.mcpServers,
    },
  };

  await fs.writeFile(targetPath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
  return { targetPath, backupPath };
}

export async function rollbackClient(
  target: ClientId,
  homeDir?: string,
): Promise<{ targetPath: string; restoredFrom: string }> {
  const discovery = await discoverClientConfig(target, homeDir);
  const targetPath = discovery.selectedPath;
  const restoredFrom = `${targetPath}.bak`;

  await fs.copyFile(restoredFrom, targetPath);
  return { targetPath, restoredFrom };
}
