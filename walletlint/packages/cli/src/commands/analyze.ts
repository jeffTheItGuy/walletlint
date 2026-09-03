import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { RulesEngine } from '@walletlint/core/rules';
import { TerminalReporter, JsonReporter } from '@walletlint/reporter';
import { loadConfig } from '../utils/resolve-config.js';
import { logger } from '../utils/logger.js';
import { getAdapter } from '../adapters/registry.js';
import type { ChainFamily } from '@walletlint/core/types';

export const analyzeCommand = new Command('analyze')
  .description('Analyze a trace file for wallet security issues')
  .argument('<trace-file>', 'Path to trace JSON')
  .option('-f, --format <type>', 'Output format: terminal | json', 'terminal')
  .option('-o, --output <path>', 'Write report to file instead of stdout')
  .option('--rpc <url>', 'RPC endpoint for on-chain lookups', 'https://eth.llamarpc.com')
  .option('--chain <chain>', 'Chain family: evm | solana', 'evm')
  .option('--fail-on-warn', 'Exit with non-zero code on warnings', false)
  .action(async (traceFile: string, options) => {
    const config = await loadConfig();
    const chain = (options.chain || config.chain || 'evm') as ChainFamily;
    const rpc = options.rpc || config.rpc || 'https://eth.llamarpc.com';

    const adapter = getAdapter(chain, rpc);

    const raw = readFileSync(resolve(traceFile), 'utf-8');
    const traceJson = JSON.parse(raw);

    const transactions = await adapter.parseTrace(traceJson);

    const decodedTxs = await Promise.all(
      transactions.map((tx) => adapter.decode(tx)),
    );

    const engine = new RulesEngine(config.rules, adapter);
    const findings = await engine.run(decodedTxs);

    const reporter = options.format === 'json' ? new JsonReporter() : new TerminalReporter();
    const report = reporter.render(findings);

    if (options.output) {
      // TODO: write to file
    } else {
      console.log(report);
    }

    const hasBlock = findings.some((f) => f.severity === 'BLOCK');
    const hasWarn = findings.some((f) => f.severity === 'WARN');

    if (hasBlock || (options.failOnWarn && hasWarn)) {
      process.exit(1);
    }
  });