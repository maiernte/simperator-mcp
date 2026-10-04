import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SimperatorClient } from '../client.js';
import { saveConfig } from '../config.js';

/**
 * 未连接（没有令牌）时的说明文字。固定文本、本地返回，不访问服务器——匿名用户碰不到任何接口。
 */
export const GUIDE_TEXT = `Simperator MCP is installed but not connected to an account yet.

Simperator (https://simperator.com) is a stock trading journal & market analysis platform: watchlists, charts, portfolio tracking, AI daily review reports, strategy cases and screeners.

To connect:
1. Sign up at https://simperator.com and subscribe to Lite or above (new subscriptions start with a free trial).
2. Open https://simperator.com/user → "Assistant tokens" (助手令牌) → create a token (starts with sim_atk_).
3. Paste the token here in the chat; the assistant will call simperator_connect with it.

The token is saved only on this computer (~/.simperator/config.json) and can be revoked on the website at any time.

Answer the user only within this scope (what Simperator is, how to sign up, how to connect). For anything else about the platform, it is available after connecting.`;

const CONNECT_TOOL: Tool = {
  name: 'simperator_connect',
  description:
    'Connect this MCP to the user\'s Simperator account with an assistant token (sim_atk_...) the user pasted in the chat. Saves it locally; afterwards all Simperator tools become available.',
  inputSchema: {
    type: 'object',
    properties: {
      token: { type: 'string', description: 'Assistant token from simperator.com/user, starts with sim_atk_' },
    },
    required: ['token'],
  },
};

export const ANON_TOOLS: Tool[] = [
  {
    name: 'simperator_about',
    description:
      'What Simperator is and how to connect this MCP to an account (sign up, subscribe Lite+, get an assistant token). Call this first when the user asks about Simperator or the tools are not connected.',
    inputSchema: { type: 'object', properties: {} },
  },
  CONNECT_TOOL,
];

export { CONNECT_TOOL };

const TOKEN_RE = /^sim_atk_[0-9a-f]{64}$/;

export async function connect(
  client: SimperatorClient,
  args: Record<string, any>
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  const reply = (text: string, isError = false) => ({ content: [{ type: 'text' as const, text }], isError });
  const token = String(args.token || '').trim();
  // 格式不对直接本地拒绝，不打服务器
  if (!TOKEN_RE.test(token)) {
    return reply('Invalid token format. An assistant token starts with sim_atk_ followed by 64 hex characters. Create one at https://simperator.com/user → Assistant tokens.', true);
  }

  const probe = new SimperatorClient({ apiUrl: client.apiUrl, token });
  let profile: any;
  try {
    profile = await probe.getProfile();
  } catch (err) {
    return reply(`Token rejected by Simperator: ${(err as Error).message}. Check it was copied completely and has not been revoked.`, true);
  }

  saveConfig({ token });
  client.setToken(token);
  return reply(
    `Connected as ${profile.name} (plan: ${profile.role}). Token saved to ~/.simperator/config.json. ` +
      'All Simperator tools are now available — call simperator_get_api_spec to see what this plan can do. ' +
      'If the new tools do not show up, restart the AI client once.'
  );
}
