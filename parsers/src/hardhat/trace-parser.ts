import type { RawTransaction } from '@walletlint/core/types';

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
  parse(traceJson: unknown): RawTransaction[] {
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
      from: entry.from as `0x${string}`,
      to: entry.to as `0x${string}`,
      data: (entry.input || '0x') as `0x${string}`,
      value: entry.value || '0',
      blockNumber: entry.blockNumber ? BigInt(entry.blockNumber) : undefined,
    }));
  }
}