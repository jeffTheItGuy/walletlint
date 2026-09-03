import { Connection } from '@solana/web3.js';
import type { ChainAdapter, NormalizedTx, ChainFamily, Rule } from '@walletlint/core/types';
import * as rules from './rules/index.js';

export class SolanaAdapter implements ChainAdapter {
  readonly chain: ChainFamily = 'solana';
  readonly nativeRules: Rule[] = Object.values(rules);
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  getClient() {
    return this.connection;
  }

  parseTrace(traceJson: unknown): NormalizedTx[] {
    const data = Array.isArray(traceJson) ? traceJson : [traceJson];
    return data.map((item, index) => this.parseTx(item, index));
  }

  async decode(tx: NormalizedTx): Promise<NormalizedTx> {
    return tx;
  }

  private parseTx(item: unknown, index: number): NormalizedTx {
    const tx = item as Record<string, unknown>;

    const signatures = tx.signatures as string[] | undefined;
    const hash = (tx.hash as string) || signatures?.[0] || `solana-tx-${index}`;

    const message = tx.message as Record<string, unknown> | undefined;
    const accountKeys = (message?.accountKeys as string[]) || (tx.accountKeys as string[]) || [];
    const instructions = (message?.instructions as unknown[]) || (tx.instructions as unknown[]) || [];

    const meta = tx.meta as Record<string, unknown> | undefined;
    const preBalances = (meta?.preBalances as number[]) || [];
    const postBalances = (meta?.postBalances as number[]) || [];

    const valueDiff =
      preBalances[0] && postBalances[0]
        ? Math.max(0, preBalances[0] - postBalances[0])
        : 0;

    const from = accountKeys[0] || '';
    const to = accountKeys[1] || accountKeys[0] || '';

    return {
      hash,
      chain: 'solana',
      from,
      to,
      value: BigInt(valueDiff),
      data: instructions.length > 0 ? JSON.stringify(instructions) : undefined,
      isContractInteraction: instructions.length > 0,
      metadata: {
        slot: tx.slot as number | undefined,
        signatures,
        accountKeys,
        instructions,
      },
    };
  }
}