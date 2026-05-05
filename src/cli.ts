#!/usr/bin/env node

import process from "node:process";

import { addServer, loadConfig, saveConfig } from "./config.js";
import { doctorConfig } from "./doctor.js";
import { exportForTarget } from "./export.js";
import { buildServerFromTemplate } from "./factory.js";
import { getTemplate, getTemplates } from "./templates.js";

const DEFAULT_CONFIG = "mcpdock.json";

function printUsage(): void {
  console.log(`mcpdock <command> [options]

Commands:
  templates [--json]
  init [--config path]
  add <template> [--name value] [--config path]
  doctor [--config path] [--json]
  export --target codex|claude-desktop|cursor [--config path]`);
}

function flagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;
  const json = hasFlag(args, "--json");
  const configPath = flagValue(args, "--config") ?? DEFAULT_CONFIG;

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(command ? 0 : 1);
  }

  switch (command) {
    case "templates": {
      const templates = getTemplates();
      if (json) {
        console.log(JSON.stringify(templates, null, 2));
      } else {
        for (const template of templates) {
          console.log(`${template.key}: ${template.command} ${template.args.join(" ")}`);
        }
      }
      return;
    }
    case "init": {
      const config = await loadConfig(configPath);
      await saveConfig(configPath, config);
      console.log(`Initialized ${configPath}`);
      return;
    }
    case "add": {
      const templateKey = args.find((arg) => !arg.startsWith("--"));
      if (!templateKey) {
        throw new Error("add requires a template key");
      }
      const template = getTemplate(templateKey);
      const name = flagValue(args, "--name");
      const config = await loadConfig(configPath);
      const server = buildServerFromTemplate(template, name);
      const updated = addServer(config, server);
      await saveConfig(configPath, updated);
      console.log(json ? JSON.stringify(server, null, 2) : `Added ${server.name} to ${configPath}`);
      return;
    }
    case "doctor": {
      const config = await loadConfig(configPath);
      const report = await doctorConfig(config);
      if (json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        for (const item of report) {
          console.log(
            `${item.name}: command=${item.commandStatus} env=${item.envStatus}${
              item.missingEnv.length > 0 ? ` missing(${item.missingEnv.join(",")})` : ""
            }`,
          );
        }
      }
      process.exit(report.every((item) => item.commandStatus === "present" && item.envStatus === "ok") ? 0 : 1);
    }
    case "export": {
      const target = flagValue(args, "--target");
      if (!target || !["codex", "claude-desktop", "cursor"].includes(target)) {
        throw new Error("export requires --target codex|claude-desktop|cursor");
      }
      const config = await loadConfig(configPath);
      console.log(JSON.stringify(exportForTarget(config, target as "codex" | "claude-desktop" | "cursor"), null, 2));
      return;
    }
    default:
      throw new Error(`unknown command: ${command}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`mcpdock error: ${message}`);
  process.exit(1);
});
