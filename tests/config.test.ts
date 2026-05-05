import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { addServer, loadConfig, saveConfig } from "../src/config.js";
import { getTemplate } from "../src/templates.js";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpDirs.map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
  tmpDirs.length = 0;
});

describe("config", () => {
  it("creates an empty config when no file exists", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(dir);

    const config = await loadConfig(path.join(dir, "mcpdock.json"));

    expect(config).toEqual({ servers: [] });
  });

  it("adds a templated server and saves it", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcpdock-"));
    tmpDirs.push(dir);
    const configPath = path.join(dir, "mcpdock.json");
    const template = getTemplate("filesystem");

    const config = addServer(
      { servers: [] },
      {
        name: "files",
        template: template.key,
        command: template.command,
        args: template.args,
        env: {},
      },
    );

    await saveConfig(configPath, config);
    const loaded = await loadConfig(configPath);

    expect(loaded.servers).toHaveLength(1);
    expect(loaded.servers[0]?.name).toBe("files");
  });
});
