import type { ServerTemplate } from "./types.js";

const templates: ServerTemplate[] = [
  {
    key: "filesystem",
    title: "Filesystem",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    env: [],
  },
  {
    key: "fetch",
    title: "Fetch",
    command: "uvx",
    args: ["mcp-server-fetch"],
    env: [],
  },
  {
    key: "github",
    title: "GitHub",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
  },
  {
    key: "playwright",
    title: "Playwright",
    command: "npx",
    args: ["-y", "@playwright/mcp"],
    env: [],
  },
];

export function getTemplates(): ServerTemplate[] {
  return templates;
}

export function getTemplate(key: string): ServerTemplate {
  const template = templates.find((item) => item.key === key);
  if (!template) {
    throw new Error(`unknown template: ${key}`);
  }
  return template;
}
