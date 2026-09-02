import type { Rule, Finding } from '../../types';

export const unknownSelectorRule: Rule = {
  id: 'unknown-selector',
  severity: 'INFO',
  description: 'Function selector not found in 4byte or Etherscan databases',
  analyze(tx): Finding | null {
    if (!tx.isContractInteraction) return null;

    if (tx.functionSelector && !tx.functionName) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `Unknown function selector ${tx.functionSelector}`,
        metadata: {
          selector: tx.functionSelector,
          fix: 'Verify contract ABI or submit signature to 4byte.directory',
        },
      };
    }

    return null;
  },
};