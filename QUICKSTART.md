# 🚀 EVOLVERSE Quick Start Guide

Get your EVOLVERSE/MEGAZION contracts deployed in minutes!

## Prerequisites

- Node.js v16+ installed
- Ethereum wallet with private key
- RPC endpoint (Alchemy, Infura, or similar)
- Sufficient ETH for gas (0.1+ ETH for testnet, 0.5+ for mainnet)

## 5-Minute Deployment

### Method 1: Automated Script (Easiest)

```bash
# Clone the repository
git clone https://github.com/Evolverse-Universe/3V30OStudios.git
cd 3V30OStudios

# Install dependencies
npm install --legacy-peer-deps

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with your credentials

# Run quick deployment
./scripts/quick_deploy.sh
```

The script will guide you through:
1. ✅ Dependency installation
2. ✅ Pre-flight checks
3. ✅ Contract compilation
4. ✅ Contract deployment
5. ✅ Deployment verification
6. ✅ Health check

### Method 2: Manual Step-by-Step

```bash
# 1. Setup
git clone https://github.com/Evolverse-Universe/3V30OStudios.git
cd 3V30OStudios
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY and RPC URLs

# 3. Initialize deployment environment
npm run deploy:init -- --network sepolia

# 4. Compile contracts
npm run compile

# 5. Deploy all contracts
npm run deploy:all -- --network sepolia

# 6. Verify deployment
npm run deploy:verify -- --network sepolia

# 7. Run health check
npm run deploy:health -- --network sepolia
```

## Environment Configuration

Edit your `.env` file with these required variables:

```bash
# Required: Deployer private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Required: RPC endpoint for your target network
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Optional but recommended: Block explorer API for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Available Networks

### Testnets (Free, Safe for Testing)

- **Sepolia** (Ethereum): `--network sepolia`
- **Mumbai** (Polygon): `--network mumbai`
- **Fuji** (Avalanche): `--network fuji`

### Mainnets (Costs Real Money!)

- **Ethereum**: `--network mainnet`
- **Polygon**: `--network polygon`
- **Avalanche**: `--network avalanche`
- **BSC**: `--network bsc`

## What Gets Deployed

When you run `npm run deploy:all`, you deploy:

### Core Infrastructure (3 contracts)
- **BLEULION_CASCADE**: Root management contract
- **BLEU_WATCHTOWER**: Monitoring and events
- **BLEU_GOV_SCROLL**: Governance system

### Token Ecosystem (4 contracts)
- **BLEUToken**: ERC-20 utility token
- **EV0L1155**: Multi-token standard (ERC-1155)
- **EV0L721**: NFT standard (ERC-721)
- **MEGAZIONHybrid1155**: Hybrid multi-token

### Utilities (2 contracts)
- **WalletID**: Identity management
- **BLEU_ENFT_MINT**: ENFT minting system

**Total: 9 contracts** fully configured and linked

## Deployment Records

All deployments are automatically recorded in:

1. **Timestamped manifest**: `deployments/<network>_<timestamp>.json`
2. **Latest manifest**: `deployments/<network>_latest.json`
3. **Unified manifest**: `config/network_manifest.json`

Example manifest:
```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "deployments": {
        "BLEULION_CASCADE": "0xAbCd...1234",
        "BLEU_WATCHTOWER": "0xEfGh...5678",
        "BLEU_GOV_SCROLL": "0xIjKl...9012"
      }
    }
  }
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy:init` | Pre-flight checks before deployment |
| `npm run deploy:all` | Deploy all contracts |
| `npm run deploy:cascade` | Deploy CASCADE only |
| `npm run deploy:governance` | Deploy governance contracts |
| `npm run deploy:verify` | Verify deployed contracts |
| `npm run deploy:health` | Run health check on deployment |
| `npm run compile` | Compile all contracts |
| `npm run clean` | Clean build artifacts |

## MCP Integration

This repository has **pre-integrated MCP (Model Context Protocol) servers**:

### GitHub MCP Server ✅
- Repository file access
- Workflow monitoring
- Issue/PR management
- Code search

### Playwright MCP Server ✅
- Browser automation
- UI testing
- Screenshot capture
- Visual verification

**Note**: MCP servers are already running - no manual startup needed!

See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for details.

## Troubleshooting

### "Insufficient funds for gas"

**Solution**: Send more ETH to your deployer address

```bash
# Check your balance
npm run deploy:init -- --network sepolia
```

### "RPC connection failed"

**Solution**: Verify your RPC URL in `.env`

```bash
# Test RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  YOUR_RPC_URL
```

### "Contract already deployed"

**Solution**: Check existing deployments

```bash
# View deployed contracts
cat config/network_manifest.json
```

### "Compilation failed"

**Solution**: Ensure dependencies are installed

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Verification on Block Explorer

After deployment, verify your contracts:

```bash
# Verify all contracts
npm run verify:all -- --network sepolia

# Or verify a single contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

## Security Best Practices

### ⚠️ Never Commit Private Keys

```bash
# Ensure .env is ignored
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Ignore .env file"
```

### 🔒 Use Hardware Wallets for Mainnet

For production deployments, use:
- Ledger
- Trezor
- Or other hardware wallet solutions

### 🧪 Always Test on Testnet First

```bash
# Test on Sepolia
npm run deploy:all -- --network sepolia
npm run deploy:verify -- --network sepolia
npm run deploy:health -- --network sepolia

# If everything works, then deploy to mainnet
npm run deploy:all -- --network mainnet
```

## Getting Help

1. **Check documentation**:
   - [DEPLOYMENT_WORKFLOW.md](./DEPLOYMENT_WORKFLOW.md) - Full deployment guide
   - [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) - MCP server usage
   - [CONTRACT_DEPLOYMENT_README.md](./CONTRACT_DEPLOYMENT_README.md) - Contract details

2. **Run diagnostics**:
   ```bash
   npm run deploy:init -- --network sepolia
   npm run deploy:health -- --network sepolia
   ```

3. **Check deployment logs**:
   ```bash
   cat deployments/sepolia_latest.json
   ```

4. **Review transaction on block explorer**:
   - Sepolia: https://sepolia.etherscan.io/
   - Mumbai: https://mumbai.polygonscan.com/
   - Fuji: https://testnet.snowtrace.io/

## Next Steps After Deployment

1. ✅ Verify contracts on block explorer
2. ✅ Run health check to ensure everything is working
3. ✅ Configure roles and permissions
4. ✅ Set up governance parameters
5. ✅ Begin minting operations
6. ✅ Connect frontend (if applicable)
7. ✅ Announce to community

## Example: Complete Testnet Deployment

```bash
# Terminal session example
$ git clone https://github.com/Evolverse-Universe/3V30OStudios.git
$ cd 3V30OStudios
$ npm install --legacy-peer-deps
$ cp .env.example .env
$ nano .env  # Add PRIVATE_KEY and SEPOLIA_RPC_URL
$ npm run deploy:init -- --network sepolia
✅ All checks passed! Ready for deployment.
$ npm run compile
✅ Contracts compiled successfully
$ npm run deploy:all -- --network sepolia
✅ All Contracts Deployed Successfully!
$ npm run deploy:verify -- --network sepolia
✅ All contracts verified successfully!
$ npm run deploy:health -- --network sepolia
✅ Overall Status: HEALTHY - All systems operational
```

## Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord/Telegram

---

**🌀 Ready to deploy the EVOLVERSE? Let's go! 🚀**
