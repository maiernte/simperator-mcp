import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SimperatorClient } from '../client.js';

export const TOOLS: Tool[] = [
  {
    name: 'simperator_get_stock_quote',
    description:
      'Get latest stock quote, current OHLCV price action, and company basic metadata for a given symbol on Simperator.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol (e.g. AAPL, NVDA, TSLA, 600519).',
        },
        market: {
          type: 'string',
          enum: ['US', 'CN'],
          description: 'Optional market (US or CN). Auto-detected if omitted.',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'simperator_get_earnings',
    description:
      'Get upcoming earnings release date and recent historical earnings performance for a symbol.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol (e.g. AAPL, MSFT).',
        },
        market: {
          type: 'string',
          enum: ['US', 'CN'],
          description: 'Optional market (US or CN). Auto-detected if omitted.',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'simperator_get_daily_report',
    description:
      'Get latest daily market review reports, macro setup assessments, and review overview from Simperator.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of recent daily reports to return (default: 1, max: 10).',
        },
      },
    },
  },
  {
    name: 'simperator_get_stock_report',
    description:
      'Get the active technical analysis review report and trade setup verdict for a specific stock.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol.',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'simperator_get_stock_research',
    description:
      'Get qualitative research report (business narrative, revenue growth drivers, hidden risks, recent catalyst news) for a stock.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol.',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'simperator_list_watchlists',
    description:
      "List user's watchlist groups, custom watch stocks, and sector ETF categories on Simperator.",
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'simperator_get_portfolio',
    description:
      "Get user's portfolio accounts, current cash balances, open positions, and recent trade actions.",
    inputSchema: {
      type: 'object',
      properties: {
        portfolioId: {
          type: 'string',
          description:
            'Specific portfolio ID to view detailed actions. If omitted, lists all user portfolios.',
        },
      },
    },
  },
  {
    name: 'simperator_get_watch_notes',
    description:
      "Get trading notes, observation comments, and score evaluations saved by the user.",
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'simperator_get_knowledge',
    description:
      'Get platform trading criteria, setup checklists, and technical knowledge points.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'simperator_list_tickets',
    description:
      "List user's customer support tickets, status, and conversation history on Simperator.",
    inputSchema: {
      type: 'object',
      properties: {
        openOnly: {
          type: 'boolean',
          description: 'If true, returns only pending or in-progress tickets.',
        },
      },
    },
  },
  {
    name: 'simperator_create_ticket',
    description:
      'Create and submit a new customer support ticket or bug report to Simperator support team.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['bug', 'question', 'feature'],
          description: 'Category of the ticket: bug report, usage question, or feature suggestion.',
        },
        title: {
          type: 'string',
          description: 'Brief, clear summary of the issue (under 200 characters).',
        },
        description: {
          type: 'string',
          description:
            'Detailed description including what happened, page/symbol, and expected results.',
        },
        to: {
          type: 'string',
          enum: ['stock', 'crypto'],
          description: 'Target project (default: stock).',
        },
      },
      required: ['type', 'title', 'description'],
    },
  },
  {
    name: 'simperator_get_api_spec',
    description:
      'Fetch the dynamic API specification and list of available endpoints for the Simperator platform based on the current caller permissions (admin/owner gets full endpoints including management & cron, standard users get assistant endpoints).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'simperator_get_qa_docs',
    description:
      'Simperator platform manual (subscription tiers & prices, notifications, tickets, MCP setup, building strategies & single-stock backtest, etc.), in three levels so you never load everything at once: no args → table of contents (doc id + section headings, no body); topic → only the matching sections; id → one full document. Search first, fetch a full document only when the sections are not enough.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Keywords in Chinese, space-separated (e.g. "订阅 到期", "telegram", "工单", "回测").',
        },
        id: {
          type: 'string',
          description: 'Document id from the table of contents, e.g. 01 or 10.',
        },
      },
    },
  },
  {
    name: 'simperator_reply_ticket',
    description: 'Post a reply, comment, or additional context to an existing customer support ticket.',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'Target ticket ID.',
        },
        text: {
          type: 'string',
          description: 'Reply text / message content.',
        },
      },
      required: ['ticketId', 'text'],
    },
  },
  {
    name: 'simperator_close_ticket',
    description: 'Mark a support ticket as resolved (verified) or reopen it (open).',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'Target ticket ID.',
        },
        status: {
          type: 'string',
          enum: ['verified', 'open'],
          description: 'Target status: verified (resolved/close) or open (reopen). Default: verified.',
        },
        resolution: {
          type: 'string',
          description: 'Optional closing note or resolution description.',
        },
      },
      required: ['ticketId'],
    },
  },
  {
    name: 'simperator_add_to_watchlist',
    description: 'Add a stock symbol to a specific watchlist group for the user.',
    inputSchema: {
      type: 'object',
      properties: {
        watchlistId: {
          type: 'string',
          description: 'Target watchlist ID (use simperator_list_watchlists to find IDs).',
        },
        symbol: {
          type: 'string',
          description: 'Stock symbol to add (e.g. AAPL, NVDA).',
        },
        market: {
          type: 'string',
          enum: ['US', 'CN'],
          description: 'Market identifier (default: US).',
        },
      },
      required: ['watchlistId', 'symbol'],
    },
  },
  {
    name: 'simperator_remove_from_watchlist',
    description: 'Remove a stock symbol from a specific watchlist group for the user.',
    inputSchema: {
      type: 'object',
      properties: {
        watchlistId: {
          type: 'string',
          description: 'Target watchlist ID.',
        },
        symbol: {
          type: 'string',
          description: 'Stock symbol to remove.',
        },
        market: {
          type: 'string',
          enum: ['US', 'CN'],
          description: 'Market identifier (default: US).',
        },
      },
      required: ['watchlistId', 'symbol'],
    },
  },
  {
    name: 'simperator_create_draft_order',
    description:
      'Create an unfilled draft trade order (status="order") in the user\'s portfolio. IMPORTANT SAFETY BOUNDARY: This only creates a pending draft order. The user must manually review and click "交割" (Deliver/Fill) in the web UI (/portfolio) to confirm actual execution and fund deduction.',
    inputSchema: {
      type: 'object',
      properties: {
        portfolioId: {
          type: 'string',
          description: 'Target portfolio ID (use simperator_get_portfolio to find IDs).',
        },
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g. AAPL).',
        },
        action: {
          type: 'string',
          enum: ['buy', 'sell'],
          description: 'Trade action: buy or sell.',
        },
        posType: {
          type: 'string',
          enum: ['open', 'add', 'cut', 'close'],
          description: 'Position type: open (new position), add (add to position), cut (reduce position), close (exit position).',
        },
        price: {
          type: 'number',
          description: 'Planned execution price / limit reference price.',
        },
        amount: {
          type: 'number',
          description: 'Planned number of shares.',
        },
        stopPrice: {
          type: 'number',
          description: 'Planned stop-loss price.',
        },
        strategy: {
          type: 'string',
          description: 'Strategy tag (e.g. 系统A, 系统B, 黄金回撤).',
        },
        note: {
          type: 'string',
          description: 'Trade planning note / rationale.',
        },
      },
      required: ['portfolioId', 'symbol', 'action', 'posType', 'price', 'amount'],
    },
  },
  {
    name: 'simperator_delete_draft_order',
    description: 'Cancel or delete an unfilled draft trade order from the portfolio.',
    inputSchema: {
      type: 'object',
      properties: {
        actionId: {
          type: 'string',
          description: 'Trade action / draft order ID to delete.',
        },
      },
      required: ['actionId'],
    },
  },
  {
    name: 'simperator_save_watch_note',
    description: 'Save or update personal market observation notes / technical annotations for a symbol.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g. AAPL).',
        },
        market: {
          type: 'string',
          enum: ['US', 'CN'],
          description: 'Market identifier (default: US).',
        },
        content: {
          type: 'string',
          description: 'Note text content.',
        },
      },
      required: ['symbol', 'content'],
    },
  },
  {
    name: 'simperator_delete_watch_note',
    description: 'Delete a personal market observation note by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Watch note ID to delete.',
        },
      },
      required: ['id'],
    },
  },
  ...SCREENER_TOOLS(),
];

/**
 * Screener tools. Limits by subscription tier (enforced by the server):
 * - lite and below: no access
 * - plus: groupId "debug" only, max 5 screeners, plans must be manual (crontab "m"), runs 1/min and 20/day
 * - pro: groupId "debug" or "product", max 30 screeners, max 3 auto plans (crontab "d"/"w"), runs 20/day
 */
function SCREENER_TOOLS(): Tool[] {
  return [
    {
      name: 'simperator_get_dsl_docs',
      description:
        'Get the full Simperator screener DSL manual (Markdown). ALWAYS read this before writing or editing a screener script; write scripts strictly by this manual.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'simperator_backtest',
      description:
        "Single-stock backtest: evaluate a DSL script (daily bars) on every past trading day of ONE symbol and return each signal's date, close, and the % change 5/10/20 trading days later, plus win rate and average change. Use it to validate a rule on 2-5 stocks the user knows BEFORE saving it as a market-wide screener (workflow: read simperator_get_dsl_docs → write script → backtest → adjust → simperator_save_screener → plan → run). Consecutive days of the same signal count once. A DSL error returns HTTP 400 with the gateway message — fix the script from it. Small samples (a few signals) are not conclusive; say so. Plus: 2/min, 100/day; Pro: 2/min, unlimited per day. A 250-day run takes ~20s.",
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Ticker, e.g. NVDA or 600519.' },
          script: { type: 'string', description: 'DSL script text (daily period).' },
          market: { type: 'string', enum: ['US', 'CN'], description: 'Market, default US.' },
          days: { type: 'number', description: 'Trading days to look back, 20-750, default 250.' },
        },
        required: ['symbol', 'script'],
      },
    },
    {
      name: 'simperator_list_screeners',
      description: "List the user's own screeners (id, name, group, period, DSL script) for a market.",
      inputSchema: {
        type: 'object',
        properties: { market: { type: 'string', enum: ['US', 'CN'], description: 'Market, default US.' } },
      },
    },
    {
      name: 'simperator_save_screener',
      description:
        'Create (omit id) or update (pass id) one of the user\'s screeners. Only fields you pass are changed on update. Translate the user\'s description into a DSL script following simperator_get_dsl_docs. groupId: "debug" (all paid tiers) or "product" (pro only; required for daily auto runs).',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Screener ID to update; omit to create.' },
          market: { type: 'string', enum: ['US', 'CN'], description: 'Market, default US.' },
          name: { type: 'string', description: 'Screener name.' },
          script: { type: 'string', description: 'DSL script text.' },
          period: { type: 'string', enum: ['D', 'W', 'H'], description: 'Bar period: D daily, W weekly, H hourly. Default D.' },
          groupId: { type: 'string', enum: ['debug', 'product'], description: 'Group, default debug.' },
          description: { type: 'string', description: 'What this screener is looking for, in plain words.' },
        },
      },
    },
    {
      name: 'simperator_delete_screener',
      description: "Delete one of the user's screeners by ID.",
      inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
    {
      name: 'simperator_list_plans',
      description: "List the user's screener plans (execution settings: symbol range, price/volume filters, schedule).",
      inputSchema: {
        type: 'object',
        properties: { screenerId: { type: 'string', description: 'Only plans of this screener (optional).' } },
      },
    },
    {
      name: 'simperator_save_plan',
      description:
        'Create (omit id) or update (pass id) a plan that runs a screener. crontab: "m" manual (default), "d" daily, "w" weekly — "d"/"w" auto runs need pro and a "product" screener, max 3 per user. Only fields you pass are changed on update.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Plan ID to update; omit to create.' },
          screenerId: { type: 'string', description: 'Screener to run (required on create).' },
          market: { type: 'string', enum: ['US', 'CN'], description: 'Market (required on create).' },
          crontab: { type: 'string', enum: ['m', 'd', 'w'], description: 'Schedule, default m (manual).' },
          symbols: { type: 'string', description: '"*" for the whole market (default), or comma-separated symbols.' },
          priceLimit: { type: 'number', description: 'Minimum price, default 20.' },
          volumeLimit: { type: 'number', description: 'Minimum volume, default 5000000.' },
          symbolType: { type: 'string', enum: ['All', 'Equity', 'ETF', 'Index'], description: 'Security type, default All.' },
          useLive: { type: 'boolean', description: "Include today's unfinished bar during market hours." },
        },
      },
    },
    {
      name: 'simperator_delete_plan',
      description: "Delete one of the user's plans by ID.",
      inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
    {
      name: 'simperator_run_plan',
      description:
        'Run a plan now and return the matched symbols. A full-market scan can take a few minutes. Rate limited (plus: 1/min, 20/day; pro: 20/day; one run at a time).',
      inputSchema: {
        type: 'object',
        properties: {
          planId: { type: 'string' },
          screenTime: { type: 'string', description: 'Screen as of this date (YYYY-MM-DD); omit for the latest trading day.' },
        },
        required: ['planId'],
      },
    },
    {
      name: 'simperator_get_plan_results',
      description: 'Get saved screening results of a plan (one record per run date).',
      inputSchema: { type: 'object', properties: { planId: { type: 'string' } }, required: ['planId'] },
    },
  ];
}

const json = (title: string, data: unknown) => ({
  content: [{ type: 'text' as const, text: `${title}\n${JSON.stringify(data, null, 2)}` }],
});

export async function handleToolCall(
  client: SimperatorClient,
  name: string,
  args: Record<string, any>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    switch (name) {
      case 'simperator_get_stock_quote': {
        const symbol = String(args.symbol || '').toUpperCase().trim();
        const market = args.market as 'US' | 'CN' | undefined;
        const [searchRes, pricesRes] = await Promise.allSettled([
          client.searchStock(symbol, market),
          client.getStockPrices(symbol, market),
        ]);
        const result = {
          symbol,
          info: searchRes.status === 'fulfilled' ? searchRes.value : null,
          prices: pricesRes.status === 'fulfilled' ? pricesRes.value : null,
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'simperator_get_earnings': {
        const symbol = String(args.symbol || '').toUpperCase().trim();
        const market = args.market as 'US' | 'CN' | undefined;
        const [last, history] = await Promise.allSettled([
          client.getLastEarnings(symbol, market),
          client.getEarningsHistory(symbol, market),
        ]);
        const result = {
          symbol,
          lastEarnings: last.status === 'fulfilled' ? last.value : null,
          earningsHistory: history.status === 'fulfilled' ? history.value : null,
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'simperator_get_daily_report': {
        const limit = Math.min(Math.max(Number(args.limit) || 1, 1), 10);
        const data = await client.getDailyReports(1, limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'simperator_get_stock_report': {
        const symbol = String(args.symbol || '').toUpperCase().trim();
        const data = await client.getStockReport(symbol);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'simperator_get_stock_research': {
        const symbol = String(args.symbol || '').toUpperCase().trim();
        const data = await client.getStockResearch(symbol);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'simperator_list_watchlists': {
        const data = await client.getWatchlists();
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'simperator_get_portfolio': {
        if (args.portfolioId) {
          const actions = await client.getPortfolioActions(String(args.portfolioId));
          return {
            content: [{ type: 'text', text: JSON.stringify(actions, null, 2) }],
          };
        }
        const portfolios = await client.getPortfolios();
        return {
          content: [{ type: 'text', text: JSON.stringify(portfolios, null, 2) }],
        };
      }

      case 'simperator_get_watch_notes': {
        const notes = await client.getWatchNotes();
        return {
          content: [{ type: 'text', text: JSON.stringify(notes, null, 2) }],
        };
      }

      case 'simperator_get_knowledge': {
        const points = await client.getKnowledgePoints();
        return {
          content: [{ type: 'text', text: JSON.stringify(points, null, 2) }],
        };
      }

      case 'simperator_list_tickets': {
        const tickets = await client.getTickets(Boolean(args.openOnly));
        return {
          content: [{ type: 'text', text: JSON.stringify(tickets, null, 2) }],
        };
      }

      case 'simperator_create_ticket': {
        const created = await client.createTicket({
          type: args.type,
          title: args.title,
          description: args.description,
          to: args.to,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Ticket created successfully! ID: ${created.id || created._id || 'ok'}\n${JSON.stringify(created, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_get_api_spec': {
        const spec = await client.getApiSpec();
        return {
          content: [{ type: 'text', text: JSON.stringify(spec, null, 2) }],
        };
      }

      case 'simperator_get_qa_docs': {
        const docs = await client.getKnowledgeQa({
          topic: args.topic ? String(args.topic) : undefined,
          id: args.id ? String(args.id) : undefined,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }],
        };
      }

      case 'simperator_reply_ticket': {
        const result = await client.replyTicket(String(args.ticketId), String(args.text));
        return {
          content: [
            {
              type: 'text',
              text: `Reply posted successfully to ticket ${args.ticketId}!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_close_ticket': {
        const targetStatus = args.status === 'open' ? 'open' : 'verified';
        const result = await client.setTicketStatus(
          String(args.ticketId),
          targetStatus,
          args.resolution ? String(args.resolution) : undefined
        );
        return {
          content: [
            {
              type: 'text',
              text: `Ticket ${args.ticketId} status updated to "${targetStatus}"!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_add_to_watchlist': {
        const result = await client.addToWatchlist(
          String(args.watchlistId),
          String(args.symbol),
          (args.market as any) || 'US'
        );
        return {
          content: [
            {
              type: 'text',
              text: `Symbol ${args.symbol} added to watchlist ${args.watchlistId}!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_remove_from_watchlist': {
        const result = await client.removeFromWatchlist(
          String(args.watchlistId),
          String(args.symbol),
          (args.market as any) || 'US'
        );
        return {
          content: [
            {
              type: 'text',
              text: `Symbol ${args.symbol} removed from watchlist ${args.watchlistId}!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_create_draft_order': {
        const order = await client.createDraftOrder({
          portfolioId: String(args.portfolioId),
          symbol: String(args.symbol),
          action: args.action,
          posType: args.posType,
          price: Number(args.price),
          amount: Number(args.amount),
          stopPrice: args.stopPrice !== undefined ? Number(args.stopPrice) : undefined,
          strategy: args.strategy ? String(args.strategy) : undefined,
          note: args.note ? String(args.note) : undefined,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Draft order created successfully! (Order ID: ${order.id})\nStatus: order (pending manual delivery by user in web UI /portfolio)\nDetails:\n${JSON.stringify(order, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_delete_draft_order': {
        const result = await client.deleteDraftOrder(String(args.actionId));
        return {
          content: [
            {
              type: 'text',
              text: `Draft order ${args.actionId} deleted/canceled successfully!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_save_watch_note': {
        const result = await client.saveWatchNote({
          market: (args.market as any) || 'US',
          symbol: String(args.symbol),
          content: String(args.content),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Watch note saved successfully for ${args.symbol}!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_delete_watch_note': {
        const result = await client.deleteWatchNote(String(args.id));
        return {
          content: [
            {
              type: 'text',
              text: `Watch note ${args.id} deleted successfully!\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'simperator_get_dsl_docs': {
        const docs = await client.getDslDocs();
        return { content: [{ type: 'text', text: docs.markdown }] };
      }

      case 'simperator_backtest':
        return json(
          'Backtest:',
          await client.backtest({
            symbol: String(args.symbol),
            script: String(args.script),
            market: args.market ? String(args.market) : undefined,
            days: args.days !== undefined ? Number(args.days) : undefined,
          })
        );

      case 'simperator_list_screeners':
        return json('Screeners:', await client.listScreeners(args.market || 'US'));

      case 'simperator_save_screener': {
        const r = await client.saveScreener({
          id: args.id,
          market: args.market || 'US',
          name: args.name,
          script: args.script,
          period: args.period,
          groupId: args.groupId,
          description: args.description,
        });
        return json(`Screener saved (ID: ${r.id}).`, r);
      }

      case 'simperator_delete_screener':
        return json(`Screener ${args.id} deleted.`, await client.deleteScreener(String(args.id)));

      case 'simperator_list_plans':
        return json('Plans:', await client.listPlans(args.screenerId));

      case 'simperator_save_plan': {
        const r = await client.savePlan({
          id: args.id,
          screenerId: args.screenerId,
          market: args.market,
          crontab: args.crontab,
          symbols: args.symbols,
          priceLimit: args.priceLimit,
          volumeLimit: args.volumeLimit,
          symbolType: args.symbolType,
          useLive: args.useLive,
        });
        return json(`Plan saved (ID: ${r.id}).`, r);
      }

      case 'simperator_delete_plan':
        return json(`Plan ${args.id} deleted.`, await client.deletePlan(String(args.id)));

      case 'simperator_run_plan': {
        const r = await client.runPlan(String(args.planId), args.screenTime);
        const head = r.errors.length
          ? `Run finished with errors: ${r.errors.join('; ')}`
          : r.finished?.message || `Run finished, ${r.matched.length} matched.`;
        return json(head, r);
      }

      case 'simperator_get_plan_results':
        return json('Plan results:', await client.getPlanResults(String(args.planId)));

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${(err as Error).message}`,
        },
      ],
    };
  }
}
