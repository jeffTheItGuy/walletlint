import type { NormalizedTx } from '@walletlint/core/types';

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
  parse(traceJson: unknown): NormalizedTx[] {
    const data = traceJson as FoundryTraceResult;

    if (data.transactions && Array.isArray(data.transactions)) {
      return data.transactions.map((tx) => ({
        hash: tx.hash,
        chain: 'evm' as const,
        from: tx.from,
        to: tx.to,
        data: tx.input,
        value: tx.value ? BigInt(tx.value) : 0n,
        isContractInteraction: false,
        metadata: tx.blockNumber ? { blockNumber: BigInt(tx.blockNumber) } : undefined,
      }));
    }

    if (data.traces && Array.isArray(data.traces)) {
      const txs: NormalizedTx[] = [];
      for (const trace of data.traces) {
        for (let i = 0; i < trace.length; i++) {
          const step = trace[i];
          if (step.op === 'CALL' && step.address && step.from) {
            txs.push({
              hash: `foundry-tx-${txs.length}`,
              chain: 'evm' as const,
              from: step.from,
              to: step.address,
              data: step.input || '0x',
              value: step.value ? BigInt(step.value) : 0n,
              isContractInteraction: false,
            });
          }
        }
      }
      return txs;
    }

    return [];
  }
}