import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { discoverClientConfig, importClientConfig, importFromClient } from "../src/import.js";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpDirs.map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
  tmpDirs.length = 0;
});

describe("importClientConfig", () => {
  it("imports mcpServers from a client config JSON file", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(dir);
    const clientConfigPath = path.join(dir, "codex.json");
    await fs.writeFile(
      clientConfigPath,
      JSON.stringify(
        {
          mcpServers: {
            github: {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-github"],
              env: {
                GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const imported = await importClientConfig(clientConfigPath, { servers: [] });

    expect(imported.servers).toEqual([
      {
        name: "github",
        template: "imported",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}",
        },
      },
    ]);
  });

  it("overwrites existing servers with the same imported name", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(dir);
    const clientConfigPath = path.join(dir, "cursor.json");
    await fs.writeFile(
      clientConfigPath,
      JSON.stringify(
        {
          mcpServers: {
            fetch: {
              command: "uvx",
              args: ["mcp-server-fetch"],
              env: {},
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const imported = await importClientConfig(clientConfigPath, {
      servers: [
        {
          name: "fetch",
          template: "fetch",
          command: "old-command",
          args: [],
          env: {},
        },
      ],
    });

    expect(imported.servers).toEqual([
      {
        name: "fetch",
        template: "imported",
        command: "uvx",
        args: ["mcp-server-fetch"],
        env: {},
      },
    ]);
  });

  it("discovers a known client config path from a custom home directory", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(dir);
    const clientConfigPath = path.join(
      dir,
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json",
    );
    await fs.mkdir(path.dirname(clientConfigPath), { recursive: true });
    await fs.writeFile(clientConfigPath, JSON.stringify({ mcpServers: {} }), "utf8");

    const discovery = await discoverClientConfig("claude-desktop", dir);

    expect(discovery.status).toBe("present");
    expect(discovery.selectedPath).toBe(clientConfigPath);
  });

  it("imports directly from a discovered client config", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(dir);
    const clientConfigPath = path.join(dir, ".codex", "config.json");
    await fs.mkdir(path.dirname(clientConfigPath), { recursive: true });
    await fs.writeFile(
      clientConfigPath,
      JSON.stringify(
        {
          mcpServers: {
            filesystem: {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
              env: {},
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const imported = await importFromClient("codex", { servers: [] }, dir);

    expect(imported.servers[0]?.name).toBe("filesystem");
    expect(imported.servers[0]?.template).toBe("imported");
  });
});
