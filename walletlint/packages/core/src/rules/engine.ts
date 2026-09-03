import type { NormalizedTx, Finding, Rule, RuleContext, ChainAdapter } from '../types/index.js';

export class RulesEngine {
  private rules: Rule[];

  constructor(
    private enabledRules: Record<string, boolean> = {},
    private adapter: ChainAdapter,
  ) {
    this.rules = adapter.nativeRules;
  }

  async run(txs: NormalizedTx[]): Promise<Finding[]> {
    const context: RuleContext = {
      adapter: this.adapter,
      config: {},
    };

    const findings: Finding[] = [];

    const applicable = this.rules.filter(
      (r) =>
        this.enabledRules[r.id] !== false &&
        r.chains.includes(this.adapter.chain),
    );

    for (const [txIndex, tx] of txs.entries()) {
      const results = await Promise.all(
        applicable.map((rule) =>
          Promise.resolve(rule.analyze(tx, context)).catch((err) => {
            console.error(`Rule ${rule.id} failed on ${tx.hash}:`, err);
            return null;
          }),
        ),
      );

      for (const result of results) {
        if (result) {
          findings.push({ ...result, txHash: tx.hash, txIndex });
        }
      }
    }

    return findings;
  }
}