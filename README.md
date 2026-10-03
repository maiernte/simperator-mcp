# simperator-mcp

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the **Simperator** stock trading and market analysis platform.

Allow your local AI assistant (Claude Desktop, Cursor, Gemini CLI, Cline, etc.) to securely query market quotes, review earnings, inspect watchlists and portfolio balances, read daily AI review reports, and submit customer support tickets.

---

## Features & Tools

| Tool Name | Category | Description | Key Arguments |
|---|---|---|---|
| `simperator_get_api_spec` | Spec | Fetch dynamic API spec & available endpoints based on caller permissions | *(none)* |
| `simperator_get_qa_docs` | Docs/QA | Retrieve platform guides, FAQs, rules & manuals (0 server Token cost) | `topic`, `id` |
| `simperator_get_stock_quote` | Market | Stock basic info, profile, exchange, and current OHLCV price action | `symbol`, `market` |
| `simperator_get_earnings` | Market | Upcoming earnings date and historical quarterly earnings records | `symbol`, `market` |
| `simperator_get_daily_report` | AI Review | Latest AI daily market review reports and macro setup assessments | `limit` |
| `simperator_get_stock_report` | AI Review | Active technical analysis review report and trade setup verdict | `symbol` |
| `simperator_get_stock_research` | Research | Qualitative research (narrative, growth drivers, key risks, news) | `symbol` |
| `simperator_get_knowledge` | Rules | Platform trading criteria, setup checklists, and technical points | *(none)* |
| `simperator_list_watchlists` | Watchlists | List user's watchlist groups, custom watch stocks, and sector ETFs | *(none)* |
| `simperator_add_to_watchlist` | Watchlists | Add a stock symbol to a specific user watchlist group | `watchlistId`, `symbol`, `market` |
| `simperator_remove_from_watchlist` | Watchlists | Remove a stock symbol from a user's watchlist group | `watchlistId`, `symbol`, `market` |
| `simperator_get_portfolio` | Portfolio | Inspect user's portfolio accounts, cash balances, and trade history | `portfolioId` |
| `simperator_create_draft_order` | Portfolio | Create pending draft trade order (status="order", pending delivery) | `portfolioId`, `symbol`, `action`, `posType`, `price`, `amount` |
| `simperator_delete_draft_order` | Portfolio | Cancel / delete an unfilled draft trade order | `actionId` |
| `simperator_get_watch_notes` | Notes | Get user's trading notes, observation comments, and score evaluations | `market`, `symbol` |
| `simperator_save_watch_note` | Notes | Save or update personal market observation notes for a symbol | `market`, `symbol`, `content` |
| `simperator_delete_watch_note` | Notes | Delete a personal observation note | `id` |
| `simperator_list_tickets` | Support | Check status and history of user's customer support tickets | `openOnly` |
| `simperator_create_ticket` | Support | Open a new support ticket or bug report directly from the AI chat | `type`, `title`, `description`, `to` |
| `simperator_reply_ticket` | Support | Post a reply or additional comment to an existing ticket | `ticketId`, `text` |
| `simperator_close_ticket` | Support | Mark a ticket as resolved (verified) or reopen it (open) | `ticketId`, `status`, `resolution` |

> ⚠️ **Trading Safety Boundary**: AI assistants can create and cancel *draft orders* (`status = 'order'`). Real trade delivery, execution confirmation, and fund deduction **must be manually confirmed by the user in the Simperator web UI (`/portfolio`)**. AI will never automatically fill real orders.

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
