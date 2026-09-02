import { z } from 'zod';

export const SeveritySchema = z.enum(['BLOCK', 'WARN', 'INFO']);

export const RuleConfigSchema = z.record(z.boolean()).default({});

export const WalletLintConfigSchema = z.object({
  rules: RuleConfigSchema,
  rpc: z.string().url().optional(),
  etherscanApiKey: z.string().optional(),
  output: z.enum(['terminal', 'json']).default('terminal'),
  failOnWarn: z.boolean().default(false),
  thresholds: z
    .object({
      highValueEth: z.string().or(z.bigint()).optional(),
    })
    .optional(),
});

export type WalletLintConfig = z.infer<typeof WalletLintConfigSchema>;