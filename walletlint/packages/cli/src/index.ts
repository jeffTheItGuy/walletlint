#!/usr/bin/env node
import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze.js';
import { scanCommand } from './commands/scan.js';
import { rulesCommand } from './commands/rules.js';
import { logger } from './utils/logger.js';

const program = new Command();

program
  .name('walletlint')
  .description('ESLint for wallet interactions')
  .version('0.1.0')
  .configureOutput({ writeErr: (str) => logger.error(str.trim()) });

program.addCommand(analyzeCommand);
program.addCommand(scanCommand);
program.addCommand(rulesCommand);

program.parseAsync(process.argv).catch((err) => {
  logger.error(err.message);
  process.exit(1);
});