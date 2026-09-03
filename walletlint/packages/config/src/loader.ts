import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { WalletLintConfigSchema, type WalletLintConfig } from '../../../../walletlint-rest/walletlint/packages/config/src/schema.js';

const CONFIG_NAMES = [
  '.walletlint.yml',
  '.walletlint.yaml',
  'walletlint.config.yml',
];

export function loadConfig(cwd: string = process.cwd()): WalletLintConfig {
  for (const name of CONFIG_NAMES) {
    const fullPath = resolve(cwd, name);
    if (existsSync(fullPath)) {
      const raw = readFileSync(fullPath, 'utf-8');
      const parsed = YAML.parse(raw);
      return WalletLintConfigSchema.parse(parsed);
    }
  }

  return WalletLintConfigSchema.parse({});
}

export function findConfigPath(cwd: string = process.cwd()): string | undefined {
  for (const name of CONFIG_NAMES) {
    const fullPath = resolve(cwd, name);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return undefined;
}