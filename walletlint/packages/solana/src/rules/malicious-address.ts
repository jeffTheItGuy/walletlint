import type { Rule, Finding } from '@walletlint/core/types';

const KNOWN_MALICIOUS = new Set<string>([]);

export const maliciousAddressRule: Rule = {
  id: 'malicious-address',
  severity: 'BLOCK',
  description: 'Blocks interactions with known malicious Solana addresses',
  chains: ['solana'],
  analyze(tx): Finding | null {
    const checks = [
      { addr: tx.to, direction: 'to' as const },
      { addr: tx.from, direction: 'from' as const },
    ];

    for (const { addr, direction } of checks) {
      if (KNOWN_MALICIOUS.has(addr)) {
        return {
          ruleId: this.id,
          severity: this.severity,
          message: `Known malicious address in ${direction}: ${addr}`,
          metadata: { flaggedAddress: addr, direction },
        };
      }
    }

    const accountKeys = tx.metadata?.accountKeys as string[] | undefined;
    if (accountKeys) {
      for (const addr of accountKeys) {
        if (KNOWN_MALICIOUS.has(addr)) {
          return {
            ruleId: this.id,
            severity: this.severity,
            message: `Known malicious address in transaction accounts: ${addr}`,
            metadata: { flaggedAddress: addr, direction: 'account' },
          };
        }
      }
    }

    return null;
  },
};