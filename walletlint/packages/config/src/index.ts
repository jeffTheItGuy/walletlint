export {
  WalletLintConfigSchema,
  RuleConfigSchema,
  SeveritySchema,
  type WalletLintConfig,
} from './schema';

export { loadConfig, findConfigPath } from './loader';