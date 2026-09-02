import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

import { TraceDecoder } from '@walletlint/core/decoder';
import { RulesEngine } from '@walletlint/core/rules';
import { TerminalReporter, JsonReporter } from '@walletlint/reporter';
import { HardhatTraceParser, FoundryTraceParser } from '@walletlint/parsers';
import { loadConfig } from '../utils/resolve-config';
import { logger } from '../utils/logger';

export const analyzeCommand = new Command('analyze')
  .description('Analyze a Hardhat or Foundry trace file')
  .argument('<trace-file>', 'Path to trace JSON')
  .option('-f, --format <type>', 'Output format: terminal | json', 'terminal')
  .option('-o, --output <path>', 'Write report to file instead of stdout')
  .option('--rpc <url>', 'RPC endpoint for on-chain lookups', 'https://eth.llamarpc.com')
  .option('--fail-on-warn', 'Exit with non-zero code on warnings', false)
  .action(async (traceFile: string, options) => {
    const config = await loadConfig();
    const raw = readFileSync(resolve(traceFile), 'utf-8');
    const traceJson = JSON.parse(raw);

    const parser = traceJson.tests ? new HardhatTraceParser() : new FoundryTraceParser();
    const transactions = parser.parse(traceJson);

    const client = createPublicClient({
      chain: mainnet,
      transport: http(options.rpc),
    });

    const decoder = new TraceDecoder(client);
    const engine = new RulesEngine(config.rules);

    const decodedTxs = await Promise.all(
      transactions.map((tx) => decoder.decode(tx))
    );

    const findings = await engine.run(decodedTxs, client);

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