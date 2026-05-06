# mcpdock

`mcpdock` is a local MCP server manager and exporter for agent clients.

It helps you keep a small, explicit catalog of MCP server definitions in one place, then export them into the config shape expected by tools such as Codex, Claude Desktop, and Cursor.

## Why this exists

The MCP ecosystem is growing fast, but the setup path is still messy:
- people copy JSON snippets from docs into multiple apps
- install commands drift across repos and blog posts
- env requirements are easy to forget
- the same MCP server gets configured repeatedly for every client

`mcpdock` gives you one local source of truth.

The practical flow is now:
- import what you already use today from an existing client config
- normalize it into `mcpdock.json`
- doctor the config
- export it back out where you need it

## Commands

- `templates` shows a curated starter catalog
- `init` creates `mcpdock.json`
- `add` adds a server definition from a template
- `audit` compares your managed config against one or more client configs
- `discover` resolves the default config path for a known client
- `import` pulls existing `mcpServers` definitions from a client config JSON
- `diff` compares your `mcpdock.json` against a target client before writing changes
- `apply` writes the exported config into a target client file, preserves unrelated top-level settings, and creates a backup when overwriting
- `doctor` checks command presence and empty env placeholders
- `export` renders client-specific JSON

## Install

```bash
npm install
npm run build
```

Run locally during development:

```bash
npx tsx src/cli.ts --help
```

## Quickstart

```bash
npx tsx src/cli.ts init
npx tsx src/cli.ts audit --clients codex,claude-desktop,cursor
npx tsx src/cli.ts discover --client claude-desktop
npx tsx src/cli.ts import --client claude-desktop
npx tsx src/cli.ts import --from ~/.codex/config.json
npx tsx src/cli.ts add github --name github-main
npx tsx src/cli.ts doctor
npx tsx src/cli.ts diff --target codex
npx tsx src/cli.ts apply --target codex
npx tsx src/cli.ts export --target codex
```

## Built-in Templates

- `filesystem`
- `fetch`
- `github`
- `playwright`

## Example Output

```json
{
  "mcpServers": {
    "github-main": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Roadmap

- richer MCP registry import
- config merge support for more agent clients
- health checks beyond command presence
- env file support and safer secret handling
- install/update workflows for packaged servers

## Portfolio

This repository is part of a larger open-source tooling batch:
- Profile hub: https://github.com/xtt1997
- `skillgrade`: trust layer for Agent Skills
- `promptdiff`: prompt/eval snapshot diff CLI
- `repocanon`: repository summary generator
- `feishu-mcp-starter`: Feishu MCP starter kit
- `csvlens-web`: browser CSV inspector

## License

MIT
