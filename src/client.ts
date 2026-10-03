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
  async getWatchlists(): Promise<any> {
    return this.request('/trade/watchlists');
  }

  // --- Portfolio & Trading ---
  async getPortfolios(): Promise<any> {
    return this.request('/portfolio');
  }

  async getPortfolioActions(portfolioId: string): Promise<any> {
    return this.request(`/portfolio/${portfolioId}/actions`);
  }

  // --- Watch Notes ---
  async getWatchNotes(): Promise<any> {
    return this.request('/watch-note');
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

  // --- Assistant Spec ---
  async getApiSpec(): Promise<any> {
    return this.request('/assistant/spec');
  }
}
