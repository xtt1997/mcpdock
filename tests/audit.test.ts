import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { auditClients } from "../src/audit.js";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpDirs.map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
  tmpDirs.length = 0;
});

describe("auditClients", () => {
  it("summarizes drift for present and missing clients", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);

    const codexPath = path.join(homeDir, ".codex", "config.json");
    await fs.mkdir(path.dirname(codexPath), { recursive: true });
    await fs.writeFile(
      codexPath,
      JSON.stringify(
        {
          mcpServers: {
            github: {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-github"],
              env: {},
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const audit = await auditClients(
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

    expect(audit).toEqual([
      {
        client: "codex",
        status: "present",
        path: codexPath,
        summary: {
          added: 1,
          changed: 0,
          removed: 0,
          unchanged: 1,
        },
      },
      {
        client: "cursor",
        status: "missing",
        path: path.join(homeDir, ".cursor", "mcp.json"),
        summary: {
          added: 2,
          changed: 0,
          removed: 0,
          unchanged: 0,
        },
      },
    ]);
  });
});
