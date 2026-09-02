# WalletLint

> **ESLint for wallet interactions.** Catch what MetaMask, Phantom, and Blowfish will flag — before you ship.

## Installation

```bash
npm install -D @walletlint/cli
# or
pnpm add -D @walletlint/cli
```

## Usage

### CLI

```bash
# Analyze a Foundry trace
npx walletlint analyze ./out/trace.json

# Scan live transactions
npx walletlint scan --address 0x... --from-block 18000000

# List all rules
npx walletlint rules
```

### GitHub Action

```yaml
- uses: your-org/walletlint/action@v1
  with:
    trace-file: ./forge-trace.json
    fail-on-warn: true
```

### Configuration

Create a `.walletlint.yml` in your project root:

```yaml
rules:
  unlimited-approve: true
  raw-eth-sign: true
  unverified-contract: false
rpc: https://eth.llamarpc.com
failOnWarn: true
```

## Monorepo Packages

| Package | Description |
|---------|-------------|
| `@walletlint/cli` | Command-line interface |
| `@walletlint/core` | Analysis engine, decoder, and rules |
| `@walletlint/abi-resolver` | Etherscan & 4byte.directory lookups |
| `@walletlint/config` | `.walletlint.yml` parsing |
| `@walletlint/parsers` | Hardhat & Foundry trace ingestion |
| `@walletlint/reporter` | Terminal, JSON, and GitHub formatters |

## License

MIT
