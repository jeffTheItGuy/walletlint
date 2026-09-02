import type { Rule, Finding } from '../../types';

const MAX_UINT256 = 2n ** 256n - 1n;
const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3'.toLowerCase();

export const unlimitedApproveRule: Rule = {
  id: 'unlimited-approve',
  severity: 'WARN',
  description: 'Detects unlimited or dangerously high token approvals',
  analyze(tx): Finding | null {
    if (!tx.functionName || !tx.args) return null;

    const isApprove =
      tx.functionName === 'approve' || tx.functionName === 'increaseAllowance';
    if (!isApprove) return null;

    const spender = String(tx.args[0]).toLowerCase();
    const amount = tx.args[1] as bigint;
    const isUnlimited = amount === MAX_UINT256 || amount > 2n ** 240n;

    if (isUnlimited || spender === PERMIT2) {
      return {
        ruleId: this.id,
        severity: this.severity,
        message: `Unlimited token approval to ${spender === PERMIT2 ? 'Permit2' : tx.args[0]}`,
        metadata: {
          spender,
          amount: amount.toString(),
          fix: 'Use bounded allowance or Permit2 with explicit amount',
        },
      };
    }

    return null;
  },
};