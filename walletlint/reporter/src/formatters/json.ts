import type { Finding } from '@walletlint/core/types';

export interface JsonReport {
  summary: {
    total: number;
    block: number;
    warn: number;
    info: number;
    clean: number;
    chains: string[];
  };
  findings: Finding[];
  generatedAt: string;
}

export class JsonReporter {
  render(findings: Finding[]): string {
    const chains = [...new Set(findings.map((f) => f.metadata?.chain as string | undefined).filter(Boolean))];

    const report: JsonReport = {
      summary: {
        total: findings.length,
        block: findings.filter((f) => f.severity === 'BLOCK').length,
        warn: findings.filter((f) => f.severity === 'WARN').length,
        info: findings.filter((f) => f.severity === 'INFO').length,
        clean: findings.length === 0 ? 1 : 0,
        chains,
      },
      findings,
      generatedAt: new Date().toISOString(),
    };
    return JSON.stringify(report, null, 2);
  }
}