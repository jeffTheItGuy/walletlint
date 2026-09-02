import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  warn: (msg: string) => console.error(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.error(chalk.red('✖'), msg),
  success: (msg: string) => console.log(chalk.green('✔'), msg),
};