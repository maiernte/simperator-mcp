# simperator-mcp

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the **Simperator** stock trading and market analysis platform.

Allow your local AI assistant (Claude Desktop, Cursor, Gemini CLI, Cline, etc.) to securely query market quotes, review earnings, inspect watchlists and portfolio balances, read daily AI review reports, and submit customer support tickets.

---

## Features & Tools

| Tool Name | Category | Description | Key Arguments |
|---|---|---|---|
| `simperator_get_api_spec` | Spec | Fetch dynamic API spec & available endpoints based on caller permissions | *(none)* |
| `simperator_get_qa_docs` | Docs/QA | Platform manual: no args = table of contents, `topic` = matching sections, `id` = full document | `topic`, `id` |
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
| `simperator_list_score_rules` | Journal | The user's score rules (read before scoring) | `market` |
| `simperator_list_score_cards` | Journal | Watch pool: scored stocks, total / core score, trigger & invalidation | `market`, `archived`, `sortBy`, `sortOrder`, `keyword` |
| `simperator_get_score_card` | Journal | One stock's per-rule scores | `market`, `symbol` |
| `simperator_save_score_card` | Journal | Score a stock into the watch pool (overwrites the card) | `market`, `symbol`, `items`, `triggerNote`, `invalidNote`, `comment` |
| `simperator_archive_score_card` | Journal | Archive a score card | `id` |
| `simperator_list_strategies` | Journal | Strategy definitions (conditions, substrategies) | `market` |
| `simperator_list_strategy_cases` | Journal | Strategy cases, all or by symbol | `market`, `symbol`, `strategyId` |
| `simperator_save_strategy_case` | Journal | Create / update a case (trade / simulate / collect) | `id`, `symbol`, `category`, `strategyId`, `strategySubstrategy`, `positions`, … |
| `simperator_get_strategy_stats` | Journal | Win rate per strategy / substrategy | `market` |
| `simperator_list_stock_arguments` | Journal | Discussion log of user-vs-AI disagreements with 10/30/60-day reviews | `market`, `symbol` |
| `simperator_save_stock_argument` | Journal | Log a disagreement | `symbol`, `date`, `decision`, `advocate`, `reasonFor`, `reasonAgainst`, `category` |
| `simperator_review_stock_arguments` | Journal | Run the due 10/30/60-day review (10/day) | `market` |
| `simperator_list_tickets` | Support | Check status and history of user's customer support tickets | `openOnly` |
| `simperator_create_ticket` | Support | Open a new support ticket or bug report directly from the AI chat | `type`, `title`, `description`, `to` |
| `simperator_reply_ticket` | Support | Post a reply or additional comment to an existing ticket | `ticketId`, `text` |
| `simperator_close_ticket` | Support | Mark a ticket as resolved (verified) or reopen it (open) | `ticketId`, `status`, `resolution` |
| `simperator_get_dsl_docs` | Screener | Full screener DSL manual — read before writing a script | *(none)* |
| `simperator_backtest` | Screener | Single-stock backtest: signals of a DSL script on one symbol's history + 5/10/20-day returns | `symbol`, `script`, `market`, `days` |
| `simperator_list_screeners` | Screener | List the user's own screeners | `market` |
| `simperator_save_screener` | Screener | Create / update a screener from a DSL script | `id`, `market`, `name`, `script`, `period`, `groupId`, `description` |
| `simperator_delete_screener` | Screener | Delete a screener | `id` |
| `simperator_list_plans` | Screener | List screener plans (range, filters, schedule) | `screenerId` |
| `simperator_save_plan` | Screener | Create / update a plan (manual, daily or weekly) | `id`, `screenerId`, `market`, `crontab`, `symbols`, `priceLimit`, `volumeLimit`, `symbolType`, `useLive` |
| `simperator_delete_plan` | Screener | Delete a plan | `id` |
| `simperator_run_plan` | Screener | Run a plan now and return matched symbols | `planId`, `screenTime` |
| `simperator_get_plan_results` | Screener | Saved results of a plan | `planId` |
| `simperator_get_bars` | Review | OHLCV bars as compact rows (daily / weekly / monthly) | `symbol`, `market`, `resolution`, `count` |
| `simperator_get_guide` | Review | The user's own active trading guide | `market` |
| `simperator_save_guide` | Review | Save a new guide version and activate it | `version`, `content`, `comment` |
| `simperator_save_daily_report` | Review | Create / overwrite today's daily review report | `portfolioId`, `reportDate`, `reportContent`, … |
| `simperator_list_active_stock_reports` | Review | Stocks under management (active stock reports) | `market` |
| `simperator_save_stock_report` | Review | Create a stock report (archives the previous one) | `symbol`, `reportDate`, `report`, `source` |
| `simperator_update_stock_report` | Review | Update / check in / archive a stock report | `id`, `currentState`, `checkin`, `appendText`, `status` |
| `simperator_save_stock_research` | Research | Save qualitative research (one per symbol) | `symbol`, `research`, `riskLevel` |
| `simperator_connect` | Setup | Connect with an assistant token pasted in the chat | `token` |

### Commands (MCP prompts)

After connecting, these show up as slash commands (Claude Code: `/mcp__simperator__review`, etc.) or in the client's prompts menu. Their text is served by Simperator, so they update without reinstalling. Lite and above.

| Prompt | What it does | Argument |
|---|---|---|
| `review` | Daily review following the user's own trading guide (helps build one first if missing); writes daily / stock reports | empty = full review; symbols = only those |
| `live` | Quick intraday look; `buy` gives an entry judgement, `close` an exit judgement; writes nothing | `SYMBOL [buy\|close]` or empty |
| `research` | Web research on a company, saved as stock research | `SYMBOL [update]` |
| `log` | Log a buy/sell disagreement, review due ones, or look up past ones | `log` / `check` / `SYMBOL` |

Screener tools require Plus or above. Plus: `debug` group only, max 5 screeners, manual plans, 1 run/min and 20/day; backtest 2/min and 100/day. Pro: `debug` / `product` groups, max 30 screeners, max 3 daily/weekly plans, 20 runs/day; backtest 2/min, unlimited per day.

> ⚠️ **Trading Safety Boundary**: AI assistants can create and cancel *draft orders* (`status = 'order'`). Real trade delivery, execution confirmation, and fund deduction **must be manually confirmed by the user in the Simperator web UI (`/portfolio`)**. AI will never automatically fill real orders.

---

## Installation & Setup

### 1. Configuration

No token is needed to install. Without one, the server exposes only `simperator_about` (how to sign up and get a token) and `simperator_connect`; paste your assistant token in the chat and the AI connects and saves it to `~/.simperator/config.json`. You can also configure it up front:

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
      "args": ["-y", "simperator-mcp@latest"],
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
- **Command**: `npx -y simperator-mcp@latest`
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

- **Token Storage**: The assistant token is stored locally (`~/.simperator/config.json` or env). If you connect by pasting it in the chat, it appears in that conversation — revoke and recreate it on simperator.com/user anytime.
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

### Release

Commit first, then one command bumps the version, builds, publishes to npm and pushes the commit + tag:

```bash
pnpm run deploy         # patch: 0.1.0 → 0.1.1
pnpm run deploy minor # minor: 0.1.0 → 0.2.0 (new tools)
```

---

## License

MIT © [Simperator](https://simperator.com)
