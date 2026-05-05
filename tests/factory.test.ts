import { describe, expect, it } from "vitest";

import { buildServerFromTemplate } from "../src/factory.js";
import { getTemplate } from "../src/templates.js";

describe("buildServerFromTemplate", () => {
  it("uses the template key as the default server name", () => {
    const server = buildServerFromTemplate(getTemplate("fetch"));

    expect(server.name).toBe("fetch");
    expect(server.template).toBe("fetch");
  });

  it("creates placeholder env values for required keys", () => {
    const server = buildServerFromTemplate(getTemplate("github"), "github-prod");

    expect(server.name).toBe("github-prod");
    expect(server.env).toEqual({
      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}",
    });
  });
});
