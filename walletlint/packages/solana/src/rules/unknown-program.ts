import type { Rule, Finding } from '@walletlint/core/types';

const KNOWN_PROGRAMS = new Set([
  '11111111111111111111111111111111',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  'ComputeBudget111111111111111111111111111111',
  'Memo1UhkJRnfHyfYM6XwDj8mMbvD5MsXBEKDMFLS6Lo',
]);

export const unknownProgramRule: Rule = {
  id: 'unknown-program',
  severity: 'WARN',
  description: 'Interacts with an unknown or unverified Solana program',
  chains: ['solana'],
  analyze(tx): Finding | null {
    if (!tx.isContractInteraction) return null;

    const instructions = tx.metadata?.instructions as Array<{ programId?: string }> | undefined;
    if (!instructions) return null;

    const unknowns = instructions
      .map((ix) => ix.programId)
      .filter((pid): pid is string => !!pid && !KNOWN_PROGRAMS.has(pid));

    if (unknowns.length > 0) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `Interaction with unknown program(s): ${[...new Set(unknowns)].join(', ')}`,
        metadata: {
          programs: [...new Set(unknowns)],
          fix: 'Verify program IDs on solscan.io or solana.fm before signing',
        },
      };
    }

    return null;
  },
};