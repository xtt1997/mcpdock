import { describe, expect, it } from "vitest";

import { doctorConfig } from "../src/doctor.js";

describe("doctorConfig", () => {
  it("flags missing command and env vars", async () => {
    const report = await doctorConfig({
      servers: [
        {
          name: "github",
          template: "github",
          command: "definitely-not-a-real-command",
          args: [],
          env: {},
        },
      ],
    });

    expect(report).toEqual([
      {
        name: "github",
        command: "definitely-not-a-real-command",
        commandStatus: "missing",
        envStatus: "ok",
        missingEnv: [],
      },
    ]);
  });

  it("flags empty env placeholders", async () => {
    const report = await doctorConfig({
      servers: [
        {
          name: "fetch",
          template: "fetch",
          command: "node",
          args: [],
          env: {
            API_KEY: "",
          },
        },
      ],
    });

    expect(report[0]?.envStatus).toBe("missing");
    expect(report[0]?.missingEnv).toEqual(["API_KEY"]);
  });
});
