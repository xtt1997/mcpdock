import type { DockConfig } from "./types.js";

export function exportForTarget(
  config: DockConfig,
  _target: "codex" | "claude-desktop" | "cursor",
): unknown {
  const mcpServers = Object.fromEntries(
    config.servers.map((server) => [
      server.name,
      {
        command: server.command,
        args: server.args,
        env: server.env,
      },
    ]),
  );

  return { mcpServers };
}
