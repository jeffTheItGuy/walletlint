import type { Rule, Finding } from '../../types';

const ETH_THRESHOLD = 10n ** 18n;

export const highValueTransferRule: Rule = {
  id: 'high-value-transfer',
  severity: 'WARN',
  description: 'Flags ETH or token transfers above a risk threshold',
  analyze(tx): Finding | null {
    if (tx.value >= ETH_THRESHOLD) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `High value transfer: ${(tx.value / 10n ** 18n).toString()} ETH`,
        metadata: {
          valueWei: tx.value.toString(),
          thresholdWei: ETH_THRESHOLD.toString(),
        },
      };
    }

    if (tx.functionName === 'transfer' && tx.args) {
      const amount = tx.args[1] as bigint;
      if (amount > 2n ** 240n) {
        return {
          ruleId: this.id,
          severity: this.severity,
          message: 'Token transfer with extremely high raw amount',
          metadata: { amount: amount.toString() },
        };
      }
    }

    return null;
  },
};