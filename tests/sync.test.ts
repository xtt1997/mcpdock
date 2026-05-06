import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { syncClients } from "../src/sync.js";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpDirs.map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
  tmpDirs.length = 0;
});

describe("syncClients", () => {
  it("applies the same managed config to multiple clients", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);

    const results = await syncClients(
      ["codex", "cursor"],
      {
        servers: [
          {
            name: "github",
            template: "imported",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: {},
          },
        ],
      },
      homeDir,
    );

    expect(results).toEqual([
      {
        client: "codex",
        targetPath: path.join(homeDir, ".codex", "config.json"),
        backupPath: null,
      },
      {
        client: "cursor",
        targetPath: path.join(homeDir, ".cursor", "mcp.json"),
        backupPath: null,
      },
    ]);

    const codex = JSON.parse(await fs.readFile(results[0]!.targetPath, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };
    const cursor = JSON.parse(await fs.readFile(results[1]!.targetPath, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };

    expect(Object.keys(codex.mcpServers)).toEqual(["github"]);
    expect(Object.keys(cursor.mcpServers)).toEqual(["github"]);
  });
});
