import type { Rule, Finding } from '@walletlint/core/types';

const KNOWN_MALICIOUS = new Set<string>([
  '0x0000000000000000000000000000000000000000',
]);

export const maliciousAddressRule: Rule = {
  id: 'malicious-address',
  severity: 'BLOCK',
  description: 'Blocks interactions with known malicious addresses',
  chains: ['evm'],
  analyze(tx): Finding | null {
    const checks = [
      { addr: tx.to.toLowerCase(), direction: 'to' as const },
      { addr: tx.from.toLowerCase(), direction: 'from' as const },
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

    return null;
  },
};