import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { SimperatorClient } from './client.js';
import { TOOLS, handleToolCall } from './tools/index.js';

export async function runMcpServer(client: SimperatorClient): Promise<void> {
  const server = new Server(
    {
      name: 'simperator-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS,
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!name) {
      throw new McpError(ErrorCode.InvalidParams, 'Tool name is required');
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
