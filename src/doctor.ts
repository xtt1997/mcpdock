import { access } from "node:fs/promises";
import { delimiter } from "node:path";

import type { DockConfig, DoctorEntry } from "./types.js";

async function commandExists(command: string): Promise<boolean> {
  if (command.includes("/")) {
    try {
      await access(command);
      return true;
    } catch {
      return false;
    }
  }

  const paths = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  for (const base of paths) {
    try {
      await access(`${base}/${command}`);
      return true;
    } catch {
      // keep checking
    }
  }
  return false;
}

export async function doctorConfig(config: DockConfig): Promise<DoctorEntry[]> {
  return Promise.all(
    config.servers.map(async (server) => {
      const missingEnv = Object.entries(server.env)
        .filter(([, value]) => value.trim() === "")
        .map(([key]) => key);

      return {
        name: server.name,
        command: server.command,
        commandStatus: (await commandExists(server.command)) ? "present" : "missing",
        envStatus: missingEnv.length === 0 ? "ok" : "missing",
        missingEnv,
      };
    }),
  );
}
