import { EvmAdapter } from '@walletlint/evm';
import { SolanaAdapter } from '@walletlint/solana';
import type { ChainAdapter, ChainFamily } from '@walletlint/core/types';

export function getAdapter(chain: ChainFamily, rpc: string): ChainAdapter {
  if (chain === 'evm') return new EvmAdapter(rpc);
  if (chain === 'solana') return new SolanaAdapter(rpc);
  throw new Error(`Unsupported chain: ${chain}`);
}