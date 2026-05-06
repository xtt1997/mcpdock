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
  const rendered = exportForTarget(config, target);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  let backupPath: string | null = null;
  try {
    await fs.access(targetPath);
    backupPath = `${targetPath}.bak`;
    await fs.copyFile(targetPath, backupPath);
  } catch {
    backupPath = null;
  }

  await fs.writeFile(targetPath, `${JSON.stringify(rendered, null, 2)}\n`, "utf8");
  return { targetPath, backupPath };
}
