import { Command } from 'commander';
import { getAdapter } from '../adapters/registry.js';
import { logger } from '../utils/logger.js';
import type { ChainFamily } from '@walletlint/core/types';

export const rulesCommand = new Command('rules')
  .description('List all available lint rules for a chain')
  .option('--json', 'Output as JSON')
  .option('--chain <chain>', 'Chain family: evm | solana', 'evm')
  .action((options) => {
    const chain = (options.chain || 'evm') as ChainFamily;
    const adapter = getAdapter(chain, 'https://eth.llamarpc.com');
    const rules = adapter.nativeRules;

    if (options.json) {
      console.log(
        JSON.stringify(
          rules.map((r) => ({
            id: r.id,
            severity: r.severity,
            description: r.description,
            chains: r.chains,
          })),
          null,
          2,
        ),
      );
      return;
    }

    logger.info(`Available rules for ${chain} (${rules.length}):\n`);
    for (const rule of rules) {
      const icon =
        rule.severity === 'BLOCK' ? '🚫' : rule.severity === 'WARN' ? '⚠️' : 'ℹ️';
      logger.info(`${icon}  ${rule.id.padEnd(28)} ${rule.description}`);
    }
  });