export type Severity = 'BLOCK' | 'WARN' | 'INFO';

export type ChainFamily = 'evm' | 'solana';

export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  txHash: string;
  txIndex: number;
  metadata?: Record<string, unknown>;
}

export interface ContractInfo {
  isVerified: boolean;
  abi?: unknown;
  name?: string;
}

export interface NormalizedTx {
  hash: string;
  chain: ChainFamily;
  from: string;
  to: string;
  value: bigint;
  data?: string;
  functionName?: string;
  functionSelector?: string;
  args?: readonly unknown[];
  contractInfo?: ContractInfo;
  isContractInteraction: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChainAdapter {
  readonly chain: ChainFamily;
  readonly nativeRules: Rule[];
  parseTrace(traceJson: unknown): NormalizedTx[] | Promise<NormalizedTx[]>;
  decode(tx: NormalizedTx): NormalizedTx | Promise<NormalizedTx>;
  getClient(): unknown;
}

export interface RuleContext {
  adapter: ChainAdapter;
  config: Record<string, unknown>;
}

export interface Rule {
  id: string;
  severity: Severity;
  description: string;
  chains: ChainFamily[];
  analyze(tx: NormalizedTx, context: RuleContext): Promise<Finding | null> | Finding | null;
}