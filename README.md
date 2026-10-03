# simperator-mcp

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the **Simperator** stock trading and market analysis platform.

Allow your local AI assistant (Claude Desktop, Cursor, Gemini CLI, Cline, etc.) to securely query market quotes, review earnings, inspect watchlists and portfolio balances, read daily AI review reports, and submit customer support tickets.

---

## Features & Tools

| Tool Name | Description | Key Arguments |
|---|---|---|
| `simperator_get_stock_quote` | Get stock basic info, company profile, exchange, and current OHLCV price action | `symbol` (e.g. `AAPL`, `NVDA`, `600519`), `market` (`US` or `CN`) |
| `simperator_get_earnings` | Retrieve upcoming earnings date and historical quarterly earnings records | `symbol`, `market` |
| `simperator_get_daily_report` | Fetch latest AI daily market review reports and macro setup assessments | `limit` (optional, default: 1) |
| `simperator_get_stock_report` | Get active technical analysis report and trade setup verdict for a specific stock | `symbol` |
| `simperator_get_stock_research` | Retrieve qualitative research (core narrative, growth drivers, key risks, recent news) | `symbol` |
| `simperator_list_watchlists` | List user's watchlist groups, custom watch stocks, and sector ETF categories | *(none)* |
| `simperator_get_portfolio` | Inspect user's portfolio accounts, cash balances, open positions, and recent actions | `portfolioId` (optional) |
| `simperator_get_watch_notes` | Get user's trading notes, observation comments, and score evaluations | *(none)* |
| `simperator_get_knowledge` | Query platform trading criteria, setup checklists, and technical knowledge points | *(none)* |
| `simperator_list_tickets` | Check status and history of user's support and bug report tickets | `openOnly` (optional boolean) |
| `simperator_create_ticket` | Open a new support ticket or bug report directly from the AI chat | `type`, `title`, `description`, `to` |

---

## Installation & Setup

### 1. Configuration

You can configure credentials either via environment variables or the CLI configuration command.

#### Option A: CLI Configuration (Recommended)
Run the config command to save your token locally in `~/.simperator/config.json`:

```bash
npx simperator-mcp config --token <YOUR_SIMPERATOR_TOKEN>
```

*(Optional: configure custom API URL)*
```bash
npx simperator-mcp config --url https://server2.simperator.com/api
```

#### Option B: Environment Variables
Set any of the following environment variables:
- `SIMPERATOR_TOKEN`: Assistant token or JWT from your Simperator account.
- `SIMPERATOR_API_URL`: Custom API endpoint (defaults to `https://server2.simperator.com/api`).
- `SIMPERATOR_USERNAME` / `SIMPERATOR_PASSWORD`: (Alternative) Direct account credentials.

---

## Integration with MCP Clients

### Claude Desktop

Edit your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add `simperator` to the `mcpServers` section:

```json
{
  "mcpServers": {
    "simperator": {
      "command": "npx",
      "args": ["-y", "simperator-mcp"],
      "env": {
        "SIMPERATOR_TOKEN": "<YOUR_TOKEN_HERE>"
      }
    }
  }
}
```

### Cursor / Windsurf

Add a new MCP server in settings:
- **Type**: `command`
- **Command**: `npx -y simperator-mcp`
- **Environment Variables**:
  - `SIMPERATOR_TOKEN`: `<YOUR_TOKEN_HERE>`

---

## Verification & Testing

Verify that your credentials and connection to Simperator work properly:

```bash
npx simperator-mcp test
```

Expected output:
```text
Testing connection to: https://server2.simperator.com/api
✓ Successfully connected and authenticated!
  User: <Your Username>
  Role: <Your Role>
```

---

## Security & Safety Boundaries

- **Zero-Token Leakage**: The assistant token is stored locally on your machine and never passed into LLM prompt contexts. The AI only sees tool definitions and tool outputs.
- **Financial Safety**: `simperator-mcp` operates in a safe assistant tier (reading market data, viewing personal watchlists/portfolios, and submitting support tickets). It **never executes live monetary transactions or auto-settlement**.
- **Cross-Platform**: Built on standard Node.js (ES2022) with `@modelcontextprotocol/sdk`.

---

## Development

```bash
# Clone and enter
cd simperator-mcp

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Test CLI
node dist/index.js status
node dist/index.js test
```

---

## License

MIT © [Simperator](https://simperator.com)
