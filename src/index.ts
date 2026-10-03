#!/usr/bin/env node
import { loadConfig, saveConfig, getConfigFilePath } from './config.js';
import { SimperatorClient } from './client.js';
import { VERSION } from './version.js';
import { runMcpServer } from './server.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
Simperator MCP Server (v${VERSION})

Usage:
  simperator-mcp                     Start MCP server in stdio mode (default)
  simperator-mcp config [options]    Update local credentials in ~/.simperator/config.json
  simperator-mcp test                Test connectivity to Simperator API
  simperator-mcp status              Display current configuration file location and status

Config options:
  --token <token>                    Set assistant token or JWT
  --url <url>                        Set API URL (default: https://server2.simperator.com/api)
  --username <user>                  Set account username
  --password <pass>                  Set account password

Environment Variables:
  SIMPERATOR_TOKEN                   Assistant token or JWT
  SIMPERATOR_API_URL                 Custom API base URL
  SIMPERATOR_USERNAME                Account username
  SIMPERATOR_PASSWORD                Account password
`);
    process.exit(0);
  }

  if (command === 'status') {
    const config = loadConfig();
    console.log(`Configuration file: ${getConfigFilePath()}`);
    console.log(`API URL: ${config.apiUrl}`);
    console.log(`Auth method: ${config.token ? 'Token' : config.username ? 'Username/Password' : 'None'}`);
    process.exit(0);
  }

  if (command === 'config') {
    const updates: Record<string, string> = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--token' && args[i + 1]) {
        updates.token = args[++i];
      } else if (args[i] === '--url' && args[i + 1]) {
        updates.apiUrl = args[++i];
      } else if (args[i] === '--username' && args[i + 1]) {
        updates.username = args[++i];
      } else if (args[i] === '--password' && args[i + 1]) {
        updates.password = args[++i];
      }
    }

    if (Object.keys(updates).length === 0) {
      console.error('Error: Please provide options to update, e.g. `simperator-mcp config --token <token>`');
      process.exit(1);
    }

    saveConfig(updates);
    console.log(`✓ Configuration successfully saved to ${getConfigFilePath()}`);
    process.exit(0);
  }

  if (command === 'test') {
    const config = loadConfig();
    console.log(`Testing connection to: ${config.apiUrl}`);
    const client = new SimperatorClient(config);
    try {
      const profile = await client.getProfile();
      console.log('✓ Successfully connected and authenticated!');
      console.log(`  User: ${profile.name || profile.username || 'Authenticated User'}`);
      console.log(`  Role: ${profile.role || profile.subscriptionRole || 'User'}`);
    } catch (err) {
      console.error(`✗ Connection/Auth failed: ${(err as Error).message}`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Default mode: Run MCP server over stdio
  const config = loadConfig();
  const client = new SimperatorClient(config);
  await runMcpServer(client);
}

main().catch((err) => {
  console.error('[simperator-mcp] Fatal error:', err);
  process.exit(1);
});
