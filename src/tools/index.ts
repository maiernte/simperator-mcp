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
];

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
