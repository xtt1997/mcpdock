import fs from "node:fs/promises";

import { exportForTarget } from "./export.js";
import { discoverClientConfig } from "./import.js";
import type { ClientId, DockConfig } from "./types.js";

export async function diffAgainstClient(
  target: ClientId,
  config: DockConfig,
  homeDir?: string,
): Promise<{
  targetPath: string;
  summary: {
    added: number;
    changed: number;
    removed: number;
    unchanged: number;
  };
  added: string[];
  changed: string[];
  removed: string[];
  unchanged: string[];
}> {
  const discovery = await discoverClientConfig(target, homeDir);
  const targetPath = discovery.selectedPath;
  const desired = exportForTarget(config, target) as {
    mcpServers: Record<string, unknown>;
  };

  let currentServers: Record<string, unknown> = {};
  if (discovery.status === "present") {
    const current = JSON.parse(await fs.readFile(targetPath, "utf8")) as {
      mcpServers?: Record<string, unknown>;
    };
    currentServers = current.mcpServers ?? {};
  }

  const keys = [...new Set([...Object.keys(currentServers), ...Object.keys(desired.mcpServers)])].sort();
  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  for (const key of keys) {
    const before = currentServers[key];
    const after = desired.mcpServers[key];

    if (before && after) {
      if (JSON.stringify(before) === JSON.stringify(after)) {
        unchanged.push(key);
      } else {
        changed.push(key);
      }
    } else if (after) {
      added.push(key);
    } else {
      removed.push(key);
    }
  }

  return {
    targetPath,
    summary: {
      added: added.length,
      changed: changed.length,
      removed: removed.length,
      unchanged: unchanged.length,
    },
    added,
    changed,
    removed,
    unchanged,
  };
}
