import type { Finding } from '@walletlint/core/types';

export class GitHubReporter {
  render(findings: Finding[]): string {
    const lines: string[] = [];

    for (const f of findings) {
      const level = f.severity === 'BLOCK' ? 'error' : f.severity === 'WARN' ? 'warning' : 'notice';
      const message = `[${f.ruleId}] ${f.message} (tx: ${f.txHash})`;
      lines.push(`::${level} title=${f.ruleId}::${message}`);
    }

    if (findings.length === 0) {
      lines.push('::notice::WalletLint: No issues found');
    }

    return lines.join('\n');
  }
}