import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { applyToClient, rollbackClient } from "../src/apply.js";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpDirs.map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
  tmpDirs.length = 0;
});

describe("applyToClient", () => {
  it("writes exported config to a discovered target path", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);

    const result = await applyToClient(
      "codex",
      {
        servers: [
          {
            name: "github",
            template: "imported",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: {
              GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}",
            },
          },
        ],
      },
      homeDir,
    );

    const written = JSON.parse(await fs.readFile(result.targetPath, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };

    expect(result.targetPath).toBe(path.join(homeDir, ".codex", "config.json"));
    expect(result.backupPath).toBeNull();
    expect(Object.keys(written.mcpServers)).toEqual(["github"]);
  });

  it("creates a backup before overwriting an existing client config", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);
    const targetPath = path.join(
      homeDir,
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json",
    );
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, JSON.stringify({ mcpServers: { old: { command: "old" } } }), "utf8");

    const result = await applyToClient(
      "claude-desktop",
      {
        servers: [
          {
            name: "fetch",
            template: "imported",
            command: "uvx",
            args: ["mcp-server-fetch"],
            env: {},
          },
        ],
      },
      homeDir,
    );

    expect(result.backupPath).toBe(`${targetPath}.bak`);
    const backup = JSON.parse(await fs.readFile(result.backupPath!, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };
    const written = JSON.parse(await fs.readFile(targetPath, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };

    expect(Object.keys(backup.mcpServers)).toEqual(["old"]);
    expect(Object.keys(written.mcpServers)).toEqual(["old", "fetch"]);
  });

  it("preserves unrelated top-level keys when applying over an existing file", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);
    const targetPath = path.join(homeDir, ".codex", "config.json");
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(
      targetPath,
      JSON.stringify(
        {
          theme: "dark",
          window: {
            zoom: 1.1,
          },
          mcpServers: {
            old: {
              command: "old",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await applyToClient(
      "codex",
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

    const written = JSON.parse(await fs.readFile(targetPath, "utf8")) as {
      theme: string;
      window: { zoom: number };
      mcpServers: Record<string, unknown>;
    };

    expect(written.theme).toBe("dark");
    expect(written.window.zoom).toBe(1.1);
    expect(Object.keys(written.mcpServers)).toEqual(["old", "github"]);
  });

  it("restores the last backup for a client config", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);
    const targetPath = path.join(homeDir, ".codex", "config.json");
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(
      targetPath,
      JSON.stringify({ theme: "dark", mcpServers: { old: { command: "old" } } }, null, 2),
      "utf8",
    );

    await applyToClient(
      "codex",
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

    const result = await rollbackClient("codex", homeDir);
    const restored = JSON.parse(await fs.readFile(targetPath, "utf8")) as {
      theme: string;
      mcpServers: Record<string, unknown>;
    };

    expect(result.targetPath).toBe(targetPath);
    expect(result.restoredFrom).toBe(`${targetPath}.bak`);
    expect(restored.theme).toBe("dark");
    expect(Object.keys(restored.mcpServers)).toEqual(["old"]);
  });
});
