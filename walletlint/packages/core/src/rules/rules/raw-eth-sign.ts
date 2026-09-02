import type { Rule, Finding } from '../../types';

export const rawEthSignRule: Rule = {
  id: 'raw-eth-sign',
  severity: 'BLOCK',
  description: 'Detects raw eth_sign usage (blind signing)',
  analyze(tx): Finding | null {
    if (tx.functionName === 'eth_sign') {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: 'Raw eth_sign detected — blind signing risk',
        metadata: { fix: 'Migrate to eth_signTypedData_v4 (EIP-712)' },
      };
    }

    if (tx.data.length === 66 && !tx.isContractInteraction) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: 'Transaction carries raw 32-byte payload — possible eth_sign data',
        metadata: { fix: 'Verify this is not blind signing; prefer EIP-712' },
      };
    }

    return null;
  },
};