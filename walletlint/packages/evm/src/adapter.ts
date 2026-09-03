import { createPublicClient, http, getAddress } from 'viem';
import { mainnet } from 'viem/chains';
import type { ChainAdapter, NormalizedTx, ChainFamily, Rule } from '@walletlint/core/types';
import { HardhatTraceParser, FoundryTraceParser } from './parsers/index.js';
import { ViemDecoder } from './decoder/index.js';
import * as rules from './rules/index.js';

export class EvmAdapter implements ChainAdapter {
  readonly chain: ChainFamily = 'evm';
  readonly nativeRules: Rule[] = Object.values(rules);
  private client;
  private decoder;

  constructor(rpcUrl: string) {
    this.client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });
    this.decoder = new ViemDecoder(this.client);
  }

  getClient() {
    return this.client;
  }

  parseTrace(traceJson: unknown): NormalizedTx[] {
    const parser = this.detectParser(traceJson);
    return parser.parse(traceJson);
  }

  async decode(tx: NormalizedTx): Promise<NormalizedTx> {
    return this.decoder.decode(tx);
  }

  private detectParser(traceJson: unknown) {
    const data = traceJson as Record<string, unknown>;
    if (data.tests && Array.isArray(data.tests)) {
      return new HardhatTraceParser();
    }
    return new FoundryTraceParser();
  }
}