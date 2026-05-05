import { describe, expect, it } from "vitest";

import { getTemplate, getTemplates } from "../src/templates.js";

describe("templates", () => {
  it("ships a small curated catalog", () => {
    const keys = getTemplates().map((template) => template.key).sort();

    expect(keys).toEqual(["fetch", "filesystem", "github", "playwright"]);
  });

  it("returns a template with command metadata", () => {
    const template = getTemplate("github");

    expect(template.command).toBe("npx");
    expect(template.args.length).toBeGreaterThan(0);
    expect(template.env).toContain("GITHUB_PERSONAL_ACCESS_TOKEN");
  });
});
