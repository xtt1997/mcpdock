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

## Commands

- `templates` shows a curated starter catalog
- `init` creates `mcpdock.json`
- `add` adds a server definition from a template
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
npx tsx src/cli.ts add github --name github-main
npx tsx src/cli.ts doctor
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

## License

MIT
