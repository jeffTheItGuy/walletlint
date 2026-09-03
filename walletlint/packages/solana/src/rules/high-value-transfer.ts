import type { Rule, Finding } from '@walletlint/core/types';

const SOL_THRESHOLD = 1_000_000_000n;

export const highValueTransferRule: Rule = {
  id: 'high-value-transfer-sol',
  severity: 'WARN',
  description: 'Flags SOL transfers above a risk threshold',
  chains: ['solana'],
  analyze(tx): Finding | null {
    if (tx.value >= SOL_THRESHOLD) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `High value SOL transfer: ${(Number(tx.value) / 1e9).toFixed(4)} SOL`,
        metadata: {
          valueLamports: tx.value.toString(),
          thresholdLamports: SOL_THRESHOLD.toString(),
        },
      };
    }
    return null;
  },
};