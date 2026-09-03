import type { NormalizedTx } from '@walletlint/core/types';

interface HardhatTraceEntry {
  txHash?: string;
  from: string;
  to: string;
  input?: string;
  value?: string;
  blockNumber?: number;
}

interface HardhatTraceJson {
  tests?: Array<{
    transactions?: HardhatTraceEntry[];
  }>;
  transactions?: HardhatTraceEntry[];
}

export class HardhatTraceParser {
  parse(traceJson: unknown): NormalizedTx[] {
    const data = traceJson as HardhatTraceJson;
    const entries: HardhatTraceEntry[] = [];

    if (data.tests) {
      for (const test of data.tests) {
        if (test.transactions) {
          entries.push(...test.transactions);
        }
      }
    }

    if (data.transactions) {
      entries.push(...data.transactions);
    }

    return entries.map((entry, index) => ({
      hash: entry.txHash || `hardhat-tx-${index}`,
      chain: 'evm' as const,
      from: entry.from,
      to: entry.to,
      data: entry.input || '0x',
      value: entry.value ? BigInt(entry.value) : 0n,
      isContractInteraction: false,
      metadata: entry.blockNumber ? { blockNumber: BigInt(entry.blockNumber) } : undefined,
    }));
  }
}