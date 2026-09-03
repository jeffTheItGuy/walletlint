import { z } from 'zod';

export const SeveritySchema = z.enum(['BLOCK', 'WARN', 'INFO']);

export const ChainFamilySchema = z.enum(['evm', 'solana']);

export const RuleConfigSchema = z.record(z.boolean()).default({});

export const WalletLintConfigSchema = z.object({
  rules: RuleConfigSchema,
  chain: ChainFamilySchema.default('evm'),
  rpc: z.string().url().optional(),
  etherscanApiKey: z.string().optional(),
  output: z.enum(['terminal', 'json']).default('terminal'),
  failOnWarn: z.boolean().default(false),
  thresholds: z
    .object({
      highValueEth: z.string().or(z.bigint()).optional(),
      highValueSol: z.string().or(z.bigint()).optional(),
    })
    .optional(),
});

export type WalletLintConfig = z.infer<typeof WalletLintConfigSchema>;
export type ChainFamily = z.infer<typeof ChainFamilySchema>;