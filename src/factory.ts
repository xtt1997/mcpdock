import type { DockServer, ServerTemplate } from "./types.js";

export function buildServerFromTemplate(
  template: ServerTemplate,
  name?: string,
): DockServer {
  return {
    name: name ?? template.key,
    template: template.key,
    command: template.command,
    args: template.args,
    env: Object.fromEntries(
      template.env.map((key) => [key, `\${${key}}`]),
    ),
  };
}
