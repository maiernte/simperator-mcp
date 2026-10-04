import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { SimperatorClient } from './client.js';
import { VERSION } from './version.js';
import { TOOLS, handleToolCall } from './tools/index.js';
import { ANON_TOOLS, CONNECT_TOOL, connect, GUIDE_TEXT } from './tools/anonymous.js';

export async function runMcpServer(client: SimperatorClient): Promise<void> {
  const server = new Server(
    {
      name: 'simperator-mcp',
      version: VERSION,
    },
    {
      capabilities: {
        tools: { listChanged: true },
        prompts: { listChanged: true },
      },
    }
  );

  // 未连接：只暴露说明 + 连接两个工具，全部本地处理，不访问服务器（connect 校验令牌除外）
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: client.hasCredentials ? [...TOOLS, CONNECT_TOOL] : ANON_TOOLS,
    };
  });

  // 命令（prompts）正文在服务器上（documents/Knowledge/助手命令），按档位过滤；未连接时为空
  const fetchPrompts = async () => (client.hasCredentials ? (await client.getPrompts()).prompts : []);

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    const prompts = await fetchPrompts().catch(() => []);
    return {
      prompts: prompts.map((p) => ({
        name: p.name,
        title: p.title,
        description: p.description,
        arguments: [{ name: 'args', description: p.args, required: false }],
      })),
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const p = (await fetchPrompts()).find((x) => x.name === request.params.name);
    if (!p) throw new McpError(ErrorCode.InvalidParams, `Prompt not found: ${request.params.name}`);
    const args = String(request.params.arguments?.args ?? '').trim();
    return {
      description: p.description,
      messages: [
        {
          role: 'user' as const,
          content: { type: 'text' as const, text: `${p.content}\n\n---\n参数：${args || '（无）'}` },
        },
      ],
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!name) {
      throw new McpError(ErrorCode.InvalidParams, 'Tool name is required');
    }

    if (name === 'simperator_connect') {
      const firstTime = !client.hasCredentials;
      const result = await connect(client, args || {});
      if (result.isError) return result;
      await server.sendToolListChanged().catch(() => {});
      await server.sendPromptListChanged().catch(() => {});
      // 首次连接：附上服务器上的使用说明（含本档位可用命令）
      if (firstTime) {
        const welcome = await client.getPrompts().then((r) => r.welcome).catch(() => '');
        if (welcome) result.content.push({ type: 'text', text: welcome });
      }
      return result;
    }

    if (!client.hasCredentials) {
      return { content: [{ type: 'text', text: GUIDE_TEXT }] };
    }

    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
    }

    return await handleToolCall(client, name, args || {});
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr because stdout is reserved for JSON-RPC MCP messages
  console.error('[simperator-mcp] Server running on stdio');
}
