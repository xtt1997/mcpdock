import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { diffAgainstClient } from "../src/diff.js";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpDirs.map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
  tmpDirs.length = 0;
});

describe("diffAgainstClient", () => {
  it("classifies added, changed, removed, and unchanged servers", async () => {
    const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(homeDir);
    const targetPath = path.join(homeDir, ".codex", "config.json");
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(
      targetPath,
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
            fetch: {
              command: "uvx",
              args: ["mcp-server-fetch"],
              env: {},
            },
            old: {
              command: "python",
              args: ["legacy.py"],
              env: {},
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const diff = await diffAgainstClient(
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
          {
            name: "fetch",
            template: "imported",
            command: "uvx",
            args: ["mcp-server-fetch", "--no-cache"],
            env: {},
          },
          {
            name: "filesystem",
            template: "imported",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
            env: {},
          },
        ],
      },
      homeDir,
    );

    expect(diff.targetPath).toBe(targetPath);
    expect(diff.summary).toEqual({
      added: 1,
      changed: 1,
      removed: 1,
      unchanged: 1,
    });
    expect(diff.added).toEqual(["filesystem"]);
    expect(diff.changed).toEqual(["fetch"]);
    expect(diff.removed).toEqual(["old"]);
    expect(diff.unchanged).toEqual(["github"]);
  });
});
