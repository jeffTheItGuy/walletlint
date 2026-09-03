import { Command } from 'commander';
import { Connection, PublicKey } from '@solana/web3.js';
import { type PublicClient } from 'viem';
import { RulesEngine } from '@walletlint/core/rules';
import { TerminalReporter } from '@walletlint/reporter';
import { loadConfig } from '../utils/resolve-config.js';
import { getAdapter } from '../adapters/registry.js';
import type { ChainFamily, NormalizedTx } from '@walletlint/core/types';

export const scanCommand = new Command('scan')
  .description('Scan live transactions from an address or block range')
  .requiredOption('--address <addr>', 'Contract or EOA to monitor')
  .option('--from-block <n>', 'Starting block or slot', 'latest')
  .option('--to-block <n>', 'Ending block or slot', 'latest')
  .option('--rpc <url>', 'RPC endpoint', 'https://eth.llamarpc.com')
  .option('--chain <chain>', 'Chain family: evm | solana', 'evm')
  .action(async (options) => {
    const config = await loadConfig();
    const chain = (options.chain || config.chain || 'evm') as ChainFamily;
    const rpc = options.rpc || config.rpc || 'https://eth.llamarpc.com';

    const adapter = getAdapter(chain, rpc);
    let txs: NormalizedTx[] = [];

    if (chain === 'evm') {
      const client = adapter.getClient() as PublicClient;
      const fromBlock =
        options.fromBlock === 'latest'
          ? await client.getBlockNumber()
          : BigInt(options.fromBlock);
      const toBlock =
        options.toBlock === 'latest' ? fromBlock : BigInt(options.toBlock);

      for (let b = fromBlock; b <= toBlock; b++) {
        const block = await client.getBlock({
          blockNumber: b,
          includeTransactions: true,
        });

        for (const tx of block.transactions) {
          if (
            typeof tx !== 'string' &&
            (tx.from === options.address || tx.to === options.address)
          ) {
            txs.push({
              hash: tx.hash,
              chain: 'evm',
              from: tx.from,
              to: tx.to || '0x0000000000000000000000000000000000000000',
              value: tx.value,
              data: tx.input,
              isContractInteraction: (tx.input && tx.input !== '0x') || false,
            });
          }
        }
      }
    } else if (chain === 'solana') {
      const connection = adapter.getClient() as Connection;
      const address = new PublicKey(options.address);
      const signatures = await connection.getSignaturesForAddress(address, {
        limit: 50,
      });

      for (const sigInfo of signatures) {
        const tx = await connection.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
        });
        if (!tx || !tx.meta) continue;

        const message = tx.transaction.message;
        const accountKeys = message.accountKeys;

        txs.push({
          hash: sigInfo.signature,
          chain: 'solana',
          from: accountKeys[0].toString(),
          to: accountKeys[1]?.toString() || accountKeys[0].toString(),
          value: BigInt(
            Math.abs(tx.meta.preBalances[0] - tx.meta.postBalances[0]),
          ),
          isContractInteraction: message.instructions.length > 0,
          metadata: { slot: tx.slot },
        });
      }
    }

    const decoded = await Promise.all(txs.map((tx) => adapter.decode(tx)));
    const engine = new RulesEngine(config.rules, adapter);
    const findings = await engine.run(decoded);

    console.log(new TerminalReporter().render(findings));
  });