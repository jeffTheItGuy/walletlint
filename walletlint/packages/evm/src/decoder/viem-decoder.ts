import {
  PublicClient,
  getAddress,
  slice,
  size,
  decodeFunctionData,
  parseAbi,
} from 'viem';
import type { NormalizedTx } from '@walletlint/core/types';
import { EtherscanResolver, FourByteResolver } from '@walletlint/abi-resolver';

export class ViemDecoder {
  private etherscan: EtherscanResolver;
  private fourbyte: FourByteResolver;

  constructor(private client: PublicClient) {
    this.etherscan = new EtherscanResolver();
    this.fourbyte = new FourByteResolver();
  }

  async decode(tx: NormalizedTx): Promise<NormalizedTx> {
    const to = getAddress(tx.to);
    const from = getAddress(tx.from);
    const value = tx.value;

    const code = await this.client.getBytecode({ address: to }).catch(() => undefined);
    const isContractInteraction = !!code && code !== '0x';

    let functionName: string | undefined;
    let functionSelector: `0x${string}` | undefined;
    let args: readonly unknown[] | undefined;
    let contractInfo = tx.contractInfo;

    if (isContractInteraction && tx.data && size(tx.data as `0x${string}`) >= 4) {
      functionSelector = slice(tx.data as `0x${string}`, 0, 4);

      let abi = await this.etherscan.getAbi(to).catch(() => undefined);

      if (abi) {
        contractInfo = { isVerified: true, abi };
      } else {
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
          const decoded = decodeFunctionData({ abi: abi as any, data: tx.data as `0x${string}` });
          functionName = decoded.functionName;
          args = decoded.args;
        } catch {
          // proxy / mismatch
        }
      }

      if (!contractInfo) {
        contractInfo = { isVerified: false };
      }
    }

    return {
      ...tx,
      from,
      to,
      value,
      functionName,
      functionSelector,
      args,
      contractInfo,
      isContractInteraction,
    };
  }
}