import type { Finding } from '@walletlint/core/types';

export class JsonReporter {
  render(findings: Finding[]): string {
    return JSON.stringify(findings, null, 2);
  }
}