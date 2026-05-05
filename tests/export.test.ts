import { describe, expect, it } from "vitest";

import { exportForTarget } from "../src/export.js";

const config = {
  servers: [
    {
      name: "github",
      template: "github",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}",
      },
    },
  ],
};

describe("exportForTarget", () => {
  it("renders codex-compatible mcpServers JSON", () => {
    const exported = exportForTarget(config, "codex") as {
      mcpServers: Record<string, unknown>;
    };

    expect(Object.keys(exported.mcpServers)).toEqual(["github"]);
  });

  it("renders claude desktop JSON", () => {
    const exported = exportForTarget(config, "claude-desktop") as {
      mcpServers: Record<string, unknown>;
    };

    expect(exported.mcpServers.github).toMatchObject({
      command: "npx",
    });
  });
});
