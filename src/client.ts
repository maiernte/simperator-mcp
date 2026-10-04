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

  get hasCredentials(): boolean {
    return !!(this.token || (this.config.username && this.config.password));
  }

  setToken(token: string): void {
    this.token = token;
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
  /** 列表接口不带正文：取最新 limit 条再逐条取全文 */
  async getDailyReports(limit = 1): Promise<any> {
    const list: any[] = await this.request('/daily-review/daily');
    return Promise.all(list.slice(0, limit).map((r) => this.request(`/daily-review/daily/detail/${r.id}`)));
  }

  async getStockReport(symbol: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(symbol);
    return this.request(`/daily-review/stock/current?market=${m}&symbol=${encodeURIComponent(symbol)}`);
  }

  async getStockResearch(symbol: string, market?: 'US' | 'CN'): Promise<any> {
    const m = market || this.detectMarket(symbol);
    return this.request(`/daily-review/research?market=${m}&symbol=${encodeURIComponent(symbol)}`);
  }

  /** K 线：UDF 数组转成 [date, o, h, l, c, v] 行，省 token */
  async getBars(symbol: string, market?: 'US' | 'CN', resolution = 'D', count = 120): Promise<any> {
    const m = market || this.detectMarket(symbol);
    const daysPerBar = resolution === 'W' ? 7 : resolution === 'M' ? 31 : 1.5;
    const to = Math.floor(Date.now() / 1000) + 86400;
    const from = to - Math.ceil(count * daysPerBar + 10) * 86400;
    const d: any = await this.request(
      `/chart/udf/history?symbol=${encodeURIComponent(symbol)}&market=${m}&resolution=${resolution}&from=${from}&to=${to}`
    );
    const t: number[] = d?.t ?? [];
    const rows = t.map((ts, i) => [new Date(ts * 1000).toISOString().slice(0, 10), d.o[i], d.h[i], d.l[i], d.c[i], d.v[i]]);
    return { symbol, market: m, resolution, columns: ['date', 'open', 'high', 'low', 'close', 'volume'], bars: rows.slice(-count) };
  }

  async getGuide(market = 'US'): Promise<any> {
    return this.request(`/daily-review/guide?market=${market}`);
  }

  async saveGuide(body: Record<string, unknown>): Promise<any> {
    return this.request('/daily-review/guide', { method: 'POST', body: JSON.stringify(body) });
  }

  async saveDailyReport(body: Record<string, unknown>): Promise<any> {
    return this.request('/daily-review/daily', { method: 'PUT', body: JSON.stringify(body) });
  }

  async listActiveStockReports(market = 'US'): Promise<any> {
    return this.request(`/daily-review/stock/active?market=${market}`);
  }

  async saveStockReport(body: Record<string, unknown>): Promise<any> {
    return this.request('/daily-review/stock', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateStockReport(id: string, body: Record<string, unknown>): Promise<any> {
    return this.request(`/daily-review/stock/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async saveStockResearch(body: Record<string, unknown>): Promise<any> {
    return this.request('/daily-review/research', { method: 'POST', body: JSON.stringify(body) });
  }

  async getPrompts(): Promise<{ welcome: string; prompts: Array<{ name: string; title: string; description: string; args: string; content: string }> }> {
    return this.request('/assistant/prompts');
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

  // --- Screeners (plus: debug group only, max 5, manual plans; pro: debug/product, max 30, 3 auto plans) ---
  async getDslDocs(): Promise<{ markdown: string }> {
    return this.request('/screener/dsl-docs');
  }

  // --- Stock score cards (watch pool) ---
  async listScoreRules(market?: string): Promise<any> {
    return this.request(`/stock-score/rules${market ? `?market=${encodeURIComponent(market)}` : ''}`);
  }

  async listScoreCards(query: { market: string; archived?: string; sortBy?: string; sortOrder?: string; keyword?: string }): Promise<any> {
    const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined) as [string, string][]);
    return this.request(`/stock-score/cards?${params}`);
  }

  async getScoreCard(market: string, symbol: string): Promise<any> {
    return this.request(`/stock-score/cards/${encodeURIComponent(market)}/${encodeURIComponent(symbol)}`);
  }

  async saveScoreCard(body: Record<string, unknown>): Promise<any> {
    return this.request('/stock-score/cards', { method: 'POST', body: JSON.stringify(body) });
  }

  async archiveScoreCard(id: string): Promise<any> {
    return this.request(`/stock-score/cards/${encodeURIComponent(id)}/archive`, { method: 'POST' });
  }

  // --- Strategy cases (trade ledger) ---
  async listStrategies(market: string): Promise<any> {
    return this.request(`/strategy/strategies?market=${encodeURIComponent(market)}`);
  }

  async listStrategyCases(market: string, strategyId?: string): Promise<any[]> {
    const qs = new URLSearchParams({ market, ...(strategyId ? { strategyId } : {}) });
    return this.request(`/strategy/cases?${qs}`);
  }

  async getCasesBySymbol(market: string, symbol: string): Promise<any> {
    return this.request(`/strategy/cases-by-symbol?market=${encodeURIComponent(market)}&symbol=${encodeURIComponent(symbol)}`);
  }

  /**
   * Server overwrites every field on update (missing ones reset to defaults), and the stored case
   * comes back with nested `strategy` that takes precedence over flat fields — so merge flat edits
   * into the stored case before posting.
   */
  async saveStrategyCase(input: Record<string, any>): Promise<any> {
    const defined = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    let body: any = defined;
    if (input.id) {
      const current = (await this.listStrategyCases(input.market)).find((c) => c.id === input.id);
      if (!current) throw new Error(`Strategy case ${input.id} not found in market ${input.market}`);
      const { strategyName, strategySubstrategy, strategyPattern, ...rest } = defined;
      body = {
        ...current,
        ...rest,
        strategy: {
          ...current.strategy,
          ...(strategyName !== undefined ? { name: strategyName } : {}),
          ...(strategySubstrategy !== undefined ? { substrategy: strategySubstrategy } : {}),
          ...(strategyPattern !== undefined ? { pattern: strategyPattern } : {}),
        },
      };
    } else if (!Array.isArray(input.positions) || !input.positions.some((p: any) => p?.position === 'open')) {
      throw new Error('A new case needs at least one position with position="open".');
    }
    return this.request('/strategy/cases', { method: 'POST', body: JSON.stringify(body) });
  }

  async getStrategyStats(market: string): Promise<any> {
    return this.request(`/strategy/stats?market=${encodeURIComponent(market)}`);
  }

  // --- Stock arguments (user vs AI disagreements) ---
  async listStockArguments(market: string, symbol?: string): Promise<any> {
    const qs = new URLSearchParams({ market, ...(symbol ? { symbol } : {}) });
    return this.request(`/stock-argument?${qs}`);
  }

  async saveStockArgument(body: Record<string, unknown>): Promise<any> {
    return this.request('/stock-argument', { method: 'POST', body: JSON.stringify(body) });
  }

  async reviewStockArguments(market: string): Promise<any> {
    return this.request(`/stock-argument/review?market=${encodeURIComponent(market)}`, { method: 'POST' });
  }

  /** Single-stock backtest (plus+): evaluate a DSL script on every past trading day of one symbol. */
  async backtest(params: { symbol: string; script: string; market?: string; days?: number }): Promise<any> {
    return this.request('/screener/backtest', { method: 'POST', body: JSON.stringify(params) });
  }

  async listScreeners(market: string): Promise<any[]> {
    return this.request(`/screener/screeners?market=${encodeURIComponent(market)}`);
  }

  /** Server replaces every field on update, so merge onto the stored screener first. */
  async saveScreener(input: {
    id?: string;
    market: string;
    name?: string;
    script?: string;
    period?: string;
    groupId?: string;
    description?: string;
  }): Promise<any> {
    const list = await this.listScreeners(input.market);
    const defined = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    let body: any;
    if (input.id) {
      const current = list.find((s) => s.id === input.id);
      if (!current) throw new Error(`Screener ${input.id} not found in market ${input.market}`);
      body = { ...current, ...defined };
    } else {
      // index > 0 is required for the daily auto run; append after the user's last screener
      const index = Math.max(0, ...list.map((s) => s.index ?? 0)) + 1;
      body = { version: 1, rating: 0, period: 'D', groupId: 'debug', runners: [], index, name: 'New screener', script: '', ...defined };
    }
    return this.request('/screener/screeners', { method: 'POST', body: JSON.stringify(body) });
  }

  async deleteScreener(id: string): Promise<any> {
    return this.request(`/screener/screeners/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async listPlans(screenerId?: string): Promise<any[]> {
    return this.request(`/screener/plans${screenerId ? `?screenerId=${encodeURIComponent(screenerId)}` : ''}`);
  }

  /** Same merge-on-update rule as saveScreener. */
  async savePlan(input: {
    id?: string;
    screenerId?: string;
    market?: string;
    crontab?: string;
    symbols?: string;
    priceLimit?: number;
    volumeLimit?: number;
    symbolType?: string;
    useLive?: boolean;
  }): Promise<any> {
    const plans = await this.listPlans();
    const defined = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    let body: any;
    if (input.id) {
      const current = plans.find((p) => p.id === input.id);
      if (!current) throw new Error(`Plan ${input.id} not found`);
      body = { ...current, ...defined };
    } else {
      if (!input.screenerId || !input.market) throw new Error('screenerId and market are required for a new plan');
      // index > 0: results are saved and the plan is eligible for the daily auto run
      const index = Math.max(0, ...plans.map((p) => p.index ?? 0)) + 1;
      body = { index, crontab: 'm', symbols: '*', volumeLimit: 5_000_000, priceLimit: 20, symbolType: 'All', ...defined };
    }
    return this.request('/screener/plans', { method: 'POST', body: JSON.stringify(body) });
  }

  async deletePlan(id: string): Promise<any> {
    return this.request(`/screener/plans/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  /**
   * Run a plan through the server's SSE endpoint and collect the outcome.
   * Progress events keep the connection alive during long full-market scans.
   */
  async runPlan(planId: string, screenTime?: string): Promise<{
    matched: { symbol: string; date?: string }[];
    finished?: any;
    errors: string[];
    info: string[];
  }> {
    const token = await this.ensureAuth();
    const qs = new URLSearchParams({ planId });
    if (screenTime) qs.set('screenTime', screenTime);
    const url = `${this.config.apiUrl}/screener/execute?${qs}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' } });
    if (!res.ok || !res.body) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const errJson: any = await res.json();
        message = errJson.message || JSON.stringify(errJson);
      } catch {
        // keep status text
      }
      throw new Error(`API Error [${res.status}] ${url}: ${message}`);
    }

    const out = { matched: [] as { symbol: string; date?: string }[], finished: undefined as any, errors: [] as string[], info: [] as string[] };
    const decoder = new TextDecoder();
    let buffer = '';
    for await (const chunk of res.body as any as AsyncIterable<Uint8Array>) {
      buffer += decoder.decode(chunk, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        let msg: any;
        try {
          msg = JSON.parse(line.slice(5).trim());
        } catch {
          continue;
        }
        if (msg.type === 'match') out.matched.push({ symbol: msg.symbol, date: msg.date });
        else if (msg.type === 'finished') out.finished = msg;
        else if (msg.type === 'error') out.errors.push(msg.message);
        else if (msg.type === 'info' && msg.message) out.info.push(msg.message);
      }
    }
    return out;
  }

  async getPlanResults(planId: string): Promise<any> {
    return this.request(`/screener/results/by-plan/${encodeURIComponent(planId)}`);
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
