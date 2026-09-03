import type { Rule, Finding } from '@walletlint/core/types';

const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3'.toLowerCase();

export const permitSignatureRule: Rule = {
  id: 'permit-signature',
  severity: 'WARN',
  description: 'Detects EIP-2612 permit or Permit2 signature interactions',
  chains: ['evm'],
  analyze(tx): Finding | null {
    if (!tx.functionName) return null;

    const isPermit =
      tx.functionName === 'permit' ||
      (tx.functionName === 'approve' && tx.to.toLowerCase() === PERMIT2);

    if (isPermit) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `Permit signature interaction detected: ${tx.functionName}`,
        metadata: {
          function: tx.functionName,
          fix: 'Ensure users understand off-chain signature risks',
        },
      };
    }

    return null;
  },
};