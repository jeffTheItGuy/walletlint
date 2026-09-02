import type { PublicClient } from 'viem';

export type Severity = 'BLOCK' | 'WARN' | 'INFO';

export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  txHash: string;
  txIndex: number;
  metadata?: Record<string, unknown>;
}

export interface RawTransaction {
  hash: string;
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint | string;
  blockNumber?: bigint;
}

export interface ContractInfo {
  isVerified: boolean;
  abi?: unknown;
  name?: string;
}

export interface DecodedTransaction {
  hash: string;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
  functionName?: string;
  functionSelector?: `0x${string}`;
  args?: readonly unknown[];
  contractInfo?: ContractInfo;
  isContractInteraction: boolean;
}

export interface RuleContext {
  client?: PublicClient;
  config: Record<string, unknown>;
}

export interface Rule {
  id: string;
  severity: Severity;
  description: string;
  analyze(tx: DecodedTransaction, context: RuleContext): Promise<Finding | null> | Finding | null;
}