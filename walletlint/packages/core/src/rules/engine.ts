import type { DecodedTransaction, Finding, Rule, RuleContext } from '../types';
import { getAllRules } from './registry';

export class RulesEngine {
  private rules: Rule[];

  constructor(
    private enabledRules: Record<string, boolean> = {},
    rules?: Rule[],
  ) {
    this.rules = rules ?? getAllRules();
  }

  async run(
    txs: DecodedTransaction[],
    client?: RuleContext['client'],
  ): Promise<Finding[]> {
    const context: RuleContext = { client, config: {} };
    const findings: Finding[] = [];

    for (const [txIndex, tx] of txs.entries()) {
      const applicable = this.rules.filter(
        (r) => this.enabledRules[r.id] !== false,
      );

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