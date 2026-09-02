#!/usr/bin/env node
import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze';
import { scanCommand } from './commands/scan';
import { rulesCommand } from './commands/rules';
import { logger } from './utils/logger';

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