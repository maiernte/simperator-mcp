import fs from 'fs';
import path from 'path';
import os from 'os';

export interface SimperatorConfig {
  apiUrl: string;
  token?: string;
  username?: string;
  password?: string;
}

const DEFAULT_API_URL = 'https://server2.simperator.com/api';
const CONFIG_DIR = path.join(os.homedir(), '.simperator');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Load configuration from Environment Variables or ~/.simperator/config.json
 */
export function loadConfig(): SimperatorConfig {
  let fileConfig: Partial<SimperatorConfig> = {};

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      fileConfig = JSON.parse(raw);
    }
  } catch (err) {
    // Ignore JSON parse errors in config file, fallback to env
  }

  const apiUrl =
    process.env.SIMPERATOR_API_URL ||
    fileConfig.apiUrl ||
    DEFAULT_API_URL;

  const token =
    process.env.SIMPERATOR_TOKEN ||
    process.env.SIMPERATOR_API_KEY ||
    fileConfig.token;

  const username =
    process.env.SIMPERATOR_USERNAME ||
    fileConfig.username;

  const password =
    process.env.SIMPERATOR_PASSWORD ||
    fileConfig.password;

  return {
    apiUrl: apiUrl.replace(/\/+$/, ''),
    token,
    username,
    password,
  };
}

/**
 * Save configuration to ~/.simperator/config.json
 */
export function saveConfig(updates: Partial<SimperatorConfig>): void {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    let existing: Partial<SimperatorConfig> = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      } catch {
        existing = {};
      }
    }
    const merged = { ...existing, ...updates };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  } catch (err) {
    throw new Error(`Failed to save configuration to ${CONFIG_FILE}: ${(err as Error).message}`);
  }
}

export function getConfigFilePath(): string {
  return CONFIG_FILE;
}
