import type { Rule } from '../types';
import { unlimitedApproveRule } from './rules/unlimited-approve';
import { unverifiedContractRule } from './rules/unverified-contract';
import { rawEthSignRule } from './rules/raw-eth-sign';
import { unknownSelectorRule } from './rules/unknown-selector';
import { newRecipientRule } from './rules/new-recipient';
import { permitSignatureRule } from './rules/permit-signature';
import { maliciousAddressRule } from './rules/malicious-address';
import { highValueTransferRule } from './rules/high-value-transfer';

const RULES: Rule[] = [
  unlimitedApproveRule,
  unverifiedContractRule,
  rawEthSignRule,
  unknownSelectorRule,
  newRecipientRule,
  permitSignatureRule,
  maliciousAddressRule,
  highValueTransferRule,
];

export function getAllRules(): Rule[] {
  return RULES;
}

export function getRuleById(id: string): Rule | undefined {
  return RULES.find((r) => r.id === id);
}