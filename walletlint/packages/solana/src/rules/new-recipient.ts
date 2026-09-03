import { Connection, PublicKey } from '@solana/web3.js';
import type { Rule, Finding, RuleContext } from '@walletlint/core/types';

export const newRecipientRule: Rule = {
  id: 'new-recipient',
  severity: 'WARN',
  description: 'Recipient account has very few transactions (new/heuristic)',
  chains: ['solana'],
  async analyze(tx, context): Promise<Finding | null> {
    const connection = context.adapter.getClient() as Connection;
    if (!connection) return null;

    try {
      const pubKey = new PublicKey(tx.to);
      const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 2 });

      if (signatures.length < 2) {
        return {
          ruleId: this.id,
          severity: this.severity,
          message: `Recipient ${tx.to} has only ${signatures.length} prior transaction(s)`,
          metadata: {
            recipientTxCount: signatures.length,
            fix: 'Verify recipient address carefully before transferring',
          },
        };
      }
    } catch {
      // Invalid pubkey or RPC failure — silent skip
    }

    return null;
  },
};