export {
  WalletLintConfigSchema,
  RuleConfigSchema,
  SeveritySchema,
  ChainFamilySchema,
  type WalletLintConfig,
  type ChainFamily,
} from './schema.js';

export { loadConfig, findConfigPath } from './loader';