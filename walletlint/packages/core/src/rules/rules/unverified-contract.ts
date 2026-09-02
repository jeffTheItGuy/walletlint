import type { Rule, Finding } from '../../types';

export const unverifiedContractRule: Rule = {
  id: 'unverified-contract',
  severity: 'WARN',
  description: 'Flags interactions with contracts lacking verified source code',
  analyze(tx): Finding | null {
    if (!tx.isContractInteraction) return null;

    if (tx.contractInfo?.isVerified === false) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `Contract ${tx.to} is not verified on Etherscan`,
        metadata: {
          contract: tx.to,
          fix: 'Run forge verify-contract or hardhat-verify before mainnet',
        },
      };
    }

    return null;
  },
};