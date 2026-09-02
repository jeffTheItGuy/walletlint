import type { Finding } from '@walletlint/core/types';

export class TerminalReporter {
  render(findings: Finding[]): string {
    // TODO: implement pretty terminal output
    return findings.map(f => `[${f.severity}] ${f.ruleId}: ${f.message}`).join('\n');
  }
}