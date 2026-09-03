import type { PublicClient } from 'viem';
import type { Rule, Finding, RuleContext } from '@walletlint/core/types';

export const newRecipientRule: Rule = {
  id: 'new-recipient',
  severity: 'WARN',
  description: 'Recipient address has very few on-chain transactions (new/heuristic)',
  chains: ['evm'],
  async analyze(tx, context): Promise<Finding | null> {
    const client = context.adapter.getClient() as PublicClient;
    if (!client) return null;

    try {
      const nonce = await client.getTransactionCount({ address: tx.to as `0x${string}` });
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