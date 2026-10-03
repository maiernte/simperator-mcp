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
      'Fetch official Simperator platform user manuals, FAQs, subscription rules, notification setup, and trading operation guides. Allows the client AI to answer user platform questions directly with zero server token cost.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Search topic or keyword (e.g. telegram, 订阅, 规则, 工单, 自选, 自带AI).',
        },
        id: {
          type: 'string',
          description: 'Optional document ID (01, 02, 03, 04, 05, 06).',
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
