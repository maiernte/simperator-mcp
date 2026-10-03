import { SimperatorConfig } from './config.js';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export class SimperatorClient {
  private config: SimperatorConfig;
  private token: string | null = null;

  constructor(config: SimperatorConfig) {
    this.config = config;
    if (config.token) {
      this.token = config.token;
    }
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Helper to detect market from symbol if not explicitly provided
   */
  detectMarket(symbol: string): 'US' | 'CN' {
    if (/^\d{6}$/.test(symbol)) {
      return 'CN';
    }
    return 'US';
  }

  /**
   * Ensure we have a valid auth token before making requests
   */
  async ensureAuth(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    if (this.config.username && this.config.password) {
      const res = await fetch(`${this.config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Login failed (${res.status}): ${errorText}`);
      }

      const data = (await res.json()) as LoginResult;
      this.token = data.token;
      return this.token;
    }

    throw new Error(
      'Authentication required: No token or credentials found. Please configure with `simperator-mcp config --token <your-token>` or set SIMPERATOR_TOKEN environment variable.'
    );
  }

  private async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.ensureAuth();
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const url = `${this.config.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const errJson: any = await res.json();
        message = errJson.message || JSON.stringify(errJson);
      } catch {
        try {
          message = await res.text();
        } catch {
          // fallback
        }
      }
      throw new Error(`API Error [${res.status}] ${url}: ${message}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  }

  // --- Verification ---
  async getProfile(): Promise<any> {
    return this.request('/user/profile');
  }

  // --- Market & Quotes ---
  async searchStock(keyword: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(keyword);
    return this.request(
      `/trade/stock/search?keyword=${encodeURIComponent(keyword)}&market=${m}`
    );
  }

  async getStockPrices(symbol: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(symbol);
    return this.request(
      `/trade/stock/prices?symbols=${encodeURIComponent(symbol)}&market=${m}`
    );
  }

  async getStockMeta(symbol: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(symbol);
    return this.request(
      `/trade/stock/meta?symbols=${encodeURIComponent(symbol)}&market=${m}`
    );
  }

  async getLastEarnings(symbol: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(symbol);
    return this.request(
      `/trade/stock/last-earnings?symbols=${encodeURIComponent(symbol)}&market=${m}`
    );
  }

  async getEarningsHistory(symbol: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(symbol);
    return this.request(
      `/trade/stock/earnings-history?symbols=${encodeURIComponent(symbol)}&market=${m}`
    );
  }

  // --- Daily Review & Reports ---
  async getDailyReports(page = 1, limit = 5): Promise<any> {
    return this.request(`/daily-review/daily?page=${page}&limit=${limit}`);
  }

  async getStockReport(symbol: string): Promise<any> {
    return this.request(`/daily-review/stock/current?symbol=${encodeURIComponent(symbol)}`);
  }

  async getStockResearch(symbol: string): Promise<any> {
    return this.request(`/daily-review/research?symbol=${encodeURIComponent(symbol)}`);
  }

  // --- Watchlists ---
  async getWatchlists(market = 'US'): Promise<any> {
    return this.request(`/trade/watchlists?market=${encodeURIComponent(market)}`);
  }

  async createWatchlist(data: {
    title: string;
    market: string;
    type?: string;
    description?: string;
    symbols?: string;
  }): Promise<any> {
    return this.request('/trade/watchlists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWatchlist(
    id: string,
    data: {
      title?: string;
      type?: string;
      description?: string;
      symbols?: string;
      color?: string;
      index?: number;
    }
  ): Promise<any> {
    return this.request(`/trade/watchlists/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWatchlist(id: string): Promise<any> {
    return this.request(`/trade/watchlists/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async addToWatchlist(watchlistId: string, symbol: string, market = 'US'): Promise<any> {
    const sym = symbol.toUpperCase().trim();
    const lists = await this.getWatchlists(market);
    const target = [...(lists.watchlists || []), ...(lists.sectors || [])].find(
      (w: any) => w.id === watchlistId
    );
    if (!target) {
      throw new Error(`Watchlist not found with ID: ${watchlistId}`);
    }
    const currentSymbols = target.symbols
      ? target.symbols.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
      : [];
    if (!currentSymbols.includes(sym)) {
      currentSymbols.push(sym);
    }
    return this.updateWatchlist(watchlistId, { symbols: currentSymbols.join(',') });
  }

  async removeFromWatchlist(watchlistId: string, symbol: string, market = 'US'): Promise<any> {
    const sym = symbol.toUpperCase().trim();
    const lists = await this.getWatchlists(market);
    const target = [...(lists.watchlists || []), ...(lists.sectors || [])].find(
      (w: any) => w.id === watchlistId
    );
    if (!target) {
      throw new Error(`Watchlist not found with ID: ${watchlistId}`);
    }
    const currentSymbols = target.symbols
      ? target.symbols.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
      : [];
    const filtered = currentSymbols.filter((s: string) => s !== sym);
    return this.updateWatchlist(watchlistId, { symbols: filtered.join(',') });
  }

  // --- Portfolio & Trading (Draft Orders) ---
  async getPortfolios(market?: string): Promise<any> {
    return this.request(`/portfolio${market ? `?market=${encodeURIComponent(market)}` : ''}`);
  }

  async getPortfolioActions(portfolioId: string): Promise<any> {
    return this.request(`/portfolio/${portfolioId}/actions`);
  }

  /**
   * 创建未交割草稿订单（status 强置为 'order'，严守交割红线）
   */
  async createDraftOrder(payload: {
    portfolioId: string;
    symbol: string;
    action: 'buy' | 'sell';
    posType: 'open' | 'add' | 'cut' | 'close';
    price: number;
    amount: number;
    stopPrice?: number;
    strategy?: string;
    note?: string;
  }): Promise<any> {
    return this.request('/portfolio/actions', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        symbol: payload.symbol.toUpperCase().trim(),
        status: 'order', // 始终是未交割草稿订单
      }),
    });
  }

  async deleteDraftOrder(actionId: string): Promise<any> {
    return this.request(`/portfolio/actions/${encodeURIComponent(actionId)}`, {
      method: 'DELETE',
    });
  }

  // --- Watch Notes ---
  async getWatchNotes(market = 'US', symbol?: string): Promise<any> {
    const params = new URLSearchParams({ market });
    if (symbol) params.set('symbol', symbol.toUpperCase().trim());
    return this.request(`/watch-note?${params.toString()}`);
  }

  async saveWatchNote(payload: {
    market: string;
    symbol: string;
    content?: string;
    [key: string]: any;
  }): Promise<any> {
    return this.request('/watch-note', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        symbol: payload.symbol.toUpperCase().trim(),
      }),
    });
  }

  async deleteWatchNote(id: string): Promise<any> {
    return this.request(`/watch-note/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Knowledge Points ---
  async getKnowledgePoints(): Promise<any> {
    return this.request('/knowledge/points');
  }

  // --- Support Tickets ---
  async getTickets(openOnly = false): Promise<any> {
    return this.request(`/support/tickets${openOnly ? '?open=true' : ''}`);
  }

  async getTicketDetail(id: string): Promise<any> {
    return this.request(`/support/tickets/${id}`);
  }

  async createTicket(payload: {
    to?: 'stock' | 'crypto';
    type: 'bug' | 'feature' | 'question';
    title: string;
    description: string;
  }): Promise<any> {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({
        to: payload.to || 'stock',
        type: payload.type,
        title: payload.title,
        description: payload.description,
      }),
    });
  }

  async replyTicket(ticketId: string, text: string): Promise<any> {
    return this.request(`/support/tickets/${encodeURIComponent(ticketId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async setTicketStatus(
    ticketId: string,
    status: 'verified' | 'open',
    resolution?: string
  ): Promise<any> {
    return this.request(`/support/tickets/${encodeURIComponent(ticketId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution }),
    });
  }

  // --- Assistant Spec & QA Docs ---
  async getApiSpec(): Promise<any> {
    return this.request('/assistant/spec');
  }

  async getKnowledgeQa(query?: { topic?: string; id?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (query?.topic) params.set('topic', query.topic);
    if (query?.id) params.set('id', query.id);
    const qs = params.toString();
    return this.request(`/assistant/qa${qs ? `?${qs}` : ''}`);
  }
}
