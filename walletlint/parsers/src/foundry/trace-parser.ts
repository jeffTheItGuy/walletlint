import type { RawTransaction } from '@walletlint/core/types';

interface FoundryTraceStep {
  op?: string;
  address?: string;
  input?: string;
  value?: string;
  from?: string;
}

interface FoundryTraceResult {
  traces?: FoundryTraceStep[][];
  transactions?: Array<{
    hash: string;
    from: string;
    to: string;
    input: string;
    value: string;
    blockNumber?: string;
  }>;
}

export class FoundryTraceParser {
  parse(traceJson: unknown): RawTransaction[] {
    const data = traceJson as FoundryTraceResult;

    // Foundry --trace output with explicit transactions array
    if (data.transactions && Array.isArray(data.transactions)) {
      return data.transactions.map((tx) => ({
        hash: tx.hash,
        from: tx.from as `0x${string}`,
        to: tx.to as `0x${string}`,
        data: tx.input as `0x${string}`,
        value: tx.value,
        blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
      }));
    }

    // Foundry trace steps — flatten CALL operations
    if (data.traces && Array.isArray(data.traces)) {
      const txs: RawTransaction[] = [];
      for (const trace of data.traces) {
        for (let i = 0; i < trace.length; i++) {
          const step = trace[i];
          if (step.op === 'CALL' && step.address && step.from) {
            txs.push({
              hash: `foundry-tx-${txs.length}`,
              from: step.from as `0x${string}`,
              to: step.address as `0x${string}`,
              data: (step.input || '0x') as `0x${string}`,
              value: step.value || '0',
            });
          }
        }
      }
      return txs;
    }

    return [];
  }
}