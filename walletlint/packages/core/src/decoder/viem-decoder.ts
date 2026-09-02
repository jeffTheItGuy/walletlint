import {
  PublicClient,
  getAddress,
  slice,
  size,
  decodeFunctionData,
  parseAbi,
} from 'viem';
import type { RawTransaction, DecodedTransaction } from '../types';
import { EtherscanResolver, FourByteResolver } from '@walletlint/abi-resolver';

export class TraceDecoder {
  private etherscan: EtherscanResolver;
  private fourbyte: FourByteResolver;

  constructor(private client: PublicClient) {
    this.etherscan = new EtherscanResolver();
    this.fourbyte = new FourByteResolver();
  }

  async decode(raw: RawTransaction): Promise<DecodedTransaction> {
    const to = getAddress(raw.to);
    const from = getAddress(raw.from);
    const value = typeof raw.value === 'string' ? BigInt(raw.value) : raw.value;

    const code = await this.client.getBytecode({ address: to }).catch(() => undefined);
    const isContractInteraction = !!code && code !== '0x';

    let functionName: string | undefined;
    let functionSelector: `0x${string}` | undefined;
    let args: readonly unknown[] | undefined;

    if (isContractInteraction && size(raw.data) >= 4) {
      functionSelector = slice(raw.data, 0, 4);

      let abi = await this.etherscan.getAbi(to).catch(() => undefined);
      let contractInfo = abi ? { isVerified: true, abi } : undefined;

      if (!abi) {
        const signature = await this.fourbyte
          .lookupSelector(functionSelector)
          .catch(() => undefined);

        if (signature) {
          try {
            abi = parseAbi([`function ${signature}`]);
          } catch {
            // malformed signature
          }
        }
      }

      if (abi) {
        try {
          const decoded = decodeFunctionData({ abi: abi as any, data: raw.data });
          functionName = decoded.functionName;
          args = decoded.args;
        } catch {
          // proxy / mismatch
        }
      }

      if (!contractInfo) {
        contractInfo = { isVerified: false };
      }

      return {
        hash: raw.hash,
        from,
        to,
        value,
        data: raw.data,
        functionName,
        functionSelector,
        args,
        contractInfo,
        isContractInteraction,
      };
    }

    return {
      hash: raw.hash,
      from,
      to,
      value,
      data: raw.data,
      isContractInteraction,
    };
  }
}