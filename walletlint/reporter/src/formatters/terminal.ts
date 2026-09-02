import type { Finding } from '@walletlint/core/types';

const ICONS: Record<string, string> = {
  BLOCK: '🚫',
  WARN: '⚠️',
  INFO: 'ℹ️',
  CLEAN: '✅',
};

export class TerminalReporter {
  render(findings: Finding[]): string {
    const blocks = findings.filter((f) => f.severity === 'BLOCK');
    const warns = findings.filter((f) => f.severity === 'WARN');
    const infos = findings.filter((f) => f.severity === 'INFO');
    const clean = findings.length === 0 ? 1 : 0;

    const lines: string[] = [];
    lines.push('');

    if (blocks.length > 0) {
      lines.push(`${ICONS.BLOCK}  ${blocks.length} BLOCK-LEVEL`);
      for (const f of blocks) {
        lines.push(`   tx#${f.txIndex}: ${f.message}`);
        if (f.metadata?.fix) {
          lines.push(`   → Fix: ${f.metadata.fix}`);
        }
        lines.push('');
      }
    }

    if (warns.length > 0) {
      lines.push(`${ICONS.WARN}  ${warns.length} WARNING${warns.length > 1 ? 'S' : ''}`);
      for (const f of warns) {
        lines.push(`   tx#${f.txIndex}: ${f.message}`);
        if (f.metadata?.fix) {
          lines.push(`   → Fix: ${f.metadata.fix}`);
        }
        lines.push('');
      }
    }

    if (infos.length > 0) {
      lines.push(`${ICONS.INFO}  ${infos.length} INFO`);
      for (const f of infos) {
        lines.push(`   tx#${f.txIndex}: ${f.message}`);
        lines.push('');
      }
    }

    if (clean > 0) {
      lines.push(`${ICONS.CLEAN}  ALL CLEAN — no wallet flags detected`);
    }

    lines.push('');
    return lines.join('\n');
  }
}