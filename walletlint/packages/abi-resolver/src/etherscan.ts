import { type Abi } from 'viem';

const ETHERSCAN_API = 'https://api.etherscan.io/api';

export interface EtherscanOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class EtherscanResolver {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: EtherscanOptions = {}) {
    this.baseUrl = options.baseUrl ?? ETHERSCAN_API;
    this.apiKey = options.apiKey ?? process.env.ETHERSCAN_API_KEY;
  }

  async getAbi(address: `0x${string}`): Promise<Abi> {
    const params = new URLSearchParams({
      module: 'contract',
      action: 'getabi',
      address,
    });

    if (this.apiKey) {
      params.append('apikey', this.apiKey);
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Etherscan HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      status: string;
      message: string;
      result: string;
    };

    if (json.status !== '1' || json.message !== 'OK') {
      throw new Error(`Etherscan error: ${json.result}`);
    }

    const abi = JSON.parse(json.result) as Abi;
    return abi;
  }

  async isVerified(address: `0x${string}`): Promise<boolean> {
    try {
      await this.getAbi(address);
      return true;
    } catch {
      return false;
    }
  }
}