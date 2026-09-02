import type { Finding } from '@walletlint/core/types';

export class GitHubReporter {
  render(findings: Finding[]): string {
    // TODO: implement GitHub Actions annotation format
    return findings.map(f => `::${f.severity.toLowerCase()}::${f.message}`).join('\n');
  }
}