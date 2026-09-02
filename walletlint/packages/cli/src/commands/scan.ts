import { Command } from 'commander';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { RulesEngine } from '@walletlint/core/rules';
import { TraceDecoder } from '@walletlint/core/decoder';
import { TerminalReporter } from '@walletlint/reporter';
import { loadConfig } from '../utils/resolve-config';

export const scanCommand = new Command('scan')
  .description('Scan live transactions from an address or block range')
  .requiredOption('--address <addr>', 'Contract or EOA to monitor')
  .option('--from-block <n>', 'Starting block', 'latest')
  .option('--to-block <n>', 'Ending block', 'latest')
  .option('--rpc <url>', 'RPC endpoint', 'https://eth.llamarpc.com')
  .action(async (options) => {
    const config = await loadConfig();
    const client = createPublicClient({
      chain: mainnet,
      transport: http(options.rpc),
    });

    const txs = await client.getTransactions({
      address: options.address,
      fromBlock: BigInt(options.fromBlock),
      toBlock: BigInt(options.toBlock),
    });

    const decoder = new TraceDecoder(client);
    const engine = new RulesEngine(config.rules);

    const decoded = await Promise.all(txs.map((tx) => decoder.decode(tx)));
    const findings = await engine.run(decoded, client);

    console.log(new TerminalReporter().render(findings));
  });