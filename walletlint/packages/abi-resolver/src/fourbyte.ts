const FOURBYTE_API = 'https://www.4byte.directory/api/v1/signatures';

export interface FourByteSignature {
  id: number;
  created_at: string;
  text_signature: string;
  hex_signature: string;
  bytes_signature: string;
}

export class FourByteResolver {
  async lookupSelector(selector: `0x${string}`): Promise<string | undefined> {
    const url = `${FOURBYTE_API}/?hex_signature=${selector}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`4byte HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      count: number;
      results: FourByteSignature[];
    };

    if (json.count === 0 || json.results.length === 0) {
      return undefined;
    }

    const sorted = json.results.sort((a, b) => b.id - a.id);
    return sorted[0].text_signature;
  }
}