import type { Rule, Finding, RuleContext } from '../../types';

export const newRecipientRule: Rule = {
  id: 'new-recipient',
  severity: 'WARN',
  description: 'Recipient address has very few on-chain transactions (new/heuristic)',
  async analyze(tx, context): Promise<Finding | null> {
    if (!context.client) return null;

    try {
      const nonce = await context.client.getTransactionCount({ address: tx.to });
      if (nonce < 2) {
        return {
          ruleId: this.id,
          severity: this.severity,
          message: `Recipient ${tx.to} has only ${Number(nonce)} prior transactions`,
          metadata: {
            recipientNonce: Number(nonce),
            fix: 'Verify recipient address carefully',
          },
        };
      }
    } catch {
      // RPC failure — silent skip
    }

    return null;
  },
};