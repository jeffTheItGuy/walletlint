import { Command } from 'commander';
import { getAllRules } from '@walletlint/core/rules';
import { logger } from '../utils/logger';

export const rulesCommand = new Command('rules')
  .description('List all available lint rules')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const rules = getAllRules();

    if (options.json) {
      console.log(JSON.stringify(rules, null, 2));
      return;
    }

    logger.info(`Available rules (${rules.length}):\n`);
    for (const rule of rules) {
      const icon = rule.severity === 'BLOCK' ? '🚫' : rule.severity === 'WARN' ? '⚠️' : 'ℹ️';
      logger.info(`${icon}  ${rule.id.padEnd(28)} ${rule.description}`);
    }
  });