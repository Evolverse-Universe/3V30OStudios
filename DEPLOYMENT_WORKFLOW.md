# EVOLVERSE Deployment Workflow

## Complete Deployment Automation Guide

This document outlines the complete automated deployment workflow for the EVOLVERSE/MEGAZION smart contract ecosystem.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Pre-Deployment Checks](#pre-deployment-checks)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Health Monitoring](#health-monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v16 or higher
- **npm** v7 or higher
- **Git** (for version control)

### Required Accounts

- **Deployer Wallet**: Ethereum address with private key
- **RPC Provider**: Alchemy, Infura, or custom RPC endpoint
- **Block Explorer API**: For contract verification (Etherscan, Polygonscan, etc.)

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/Evolverse-Universe/3V30OStudios.git
cd 3V30OStudios

# Install dependencies
npm install --legacy-peer-deps
```

---

## Environment Setup

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` with your credentials:

```bash
# Deployer Private Key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs for Testnets
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# RPC URLs for Mainnets (use with caution!)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Block Explorer API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

### Step 3: Secure Your Environment

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore

# Set proper permissions
chmod 600 .env
```

---

## Pre-Deployment Checks

### Step 1: Run Initialization Script

The initialization script performs comprehensive pre-flight checks:

```bash
npm run deploy:init -- --network sepolia
```

This checks:
- ✅ Environment variables are configured
- ✅ Network connectivity is working
- ✅ Deployer wallet has sufficient balance
- ✅ Directory structure is correct
- ✅ Deployment manifest exists

**Example Output:**

```
═══════════════════════════════════════════════════════════
🚀 EVOLVERSE Deployment Initialization
═══════════════════════════════════════════════════════════

📋 Check 1: Environment Variables
─────────────────────────────────────────
   ✅ Found: PRIVATE_KEY
   ✅ Found: SEPOLIA_RPC_URL
   ✅ Found: ETHERSCAN_API_KEY

🌐 Check 2: Network Configuration
─────────────────────────────────────────
   Current Network: sepolia
   Chain ID: 11155111
   ✅ Using live network

🔌 Check 3: RPC Connectivity
─────────────────────────────────────────
   ✅ Connected to RPC
   Latest Block: 4567890

👤 Check 4: Deployer Wallet
─────────────────────────────────────────
   Address: 0x1234...5678
   Balance: 0.5 ETH
   ✅ Sufficient balance

✅ All checks passed! Ready for deployment.
```

### Step 2: Compile Contracts

```bash
npm run compile
```

Ensure all contracts compile without errors.

---

## Deployment Process

### Option 1: Full Deployment (Recommended)

Deploy all contracts in the correct dependency order:

```bash
# For testnet deployment
npm run deploy:all -- --network sepolia

# For mainnet deployment (use with EXTREME caution!)
npm run deploy:all -- --network polygon
```

**What this deploys:**

1. **Phase 1: Core Infrastructure**
   - BLEULION_CASCADE (root contract)
   - BLEU_WATCHTOWER (monitoring system)
   - BLEU_GOV_SCROLL (governance)

2. **Phase 2: Token Contracts**
   - BLEUToken (ERC-20)
   - EV0L1155 (multi-token)
   - EV0L721 (NFT)
   - MEGAZIONHybrid1155 (hybrid)

3. **Phase 3: Utility Contracts**
   - WalletID (identity)
   - BLEU_ENFT_MINT (minting system)

4. **Phase 4: Configuration**
   - Link CASCADE to WATCHTOWER
   - Set initial permissions

**Example Output:**

```
═══════════════════════════════════════════════════════════
🔵 EVOLVERSE / MEGAZION Contract Deployment Suite
═══════════════════════════════════════════════════════════
Network:        sepolia
Chain ID:       11155111
Deployer:       0x1234...5678
Balance:        0.5 ETH
═══════════════════════════════════════════════════════════

📦 Phase 1: Core Infrastructure Contracts
─────────────────────────────────────────

1️⃣  Deploying BLEULION_CASCADE...
   ✅ BLEULION_CASCADE deployed at: 0xAbCd...1234
      Tx: 0x1234...abcd

2️⃣  Deploying BLEU_WATCHTOWER...
   ✅ BLEU_WATCHTOWER deployed at: 0xEfGh...5678
      Tx: 0x5678...efgh

[... continues for all contracts ...]

✅ All Contracts Deployed Successfully!

📋 Deployment Summary:

   BLEULION_CASCADE          0xAbCd...1234
   BLEU_WATCHTOWER          0xEfGh...5678
   BLEU_GOV_SCROLL          0xIjKl...9012
   [...]
```

### Option 2: Incremental Deployment

Deploy contracts individually:

```bash
# Deploy just the CASCADE contract
npm run deploy:cascade -- --network sepolia

# Deploy just governance contracts
npm run deploy:governance -- --network sepolia

# Deploy just treasury contracts
npm run deploy:treasury -- --network sepolia
```

### Deployment Records

All deployments are recorded in two locations:

1. **Timestamped Manifest**: `deployments/<network>_<timestamp>.json`
2. **Latest Manifest**: `deployments/<network>_latest.json`
3. **Unified Manifest**: `config/network_manifest.json`

---

## Post-Deployment Verification

### Step 1: Run Verification Script

```bash
npm run deploy:verify -- --network sepolia
```

This verifies:
- ✅ All contracts are deployed
- ✅ Contract bytecode exists
- ✅ Contracts are accessible
- ✅ Dependencies are correctly linked

**Example Output:**

```
═══════════════════════════════════════════════════════════
🔍 EVOLVERSE Deployment Verification
═══════════════════════════════════════════════════════════

Network: sepolia
Chain ID: 11155111

📋 Loading deployment manifest...

Found 9 deployed contracts:
   • BLEULION_CASCADE: 0xAbCd...1234
   • BLEU_WATCHTOWER: 0xEfGh...5678
   [...]

🔍 Verifying contracts...

Checking BLEULION_CASCADE...
   ✅ Contract verified successfully
   Deployed: ✅
   Bytecode: ✅
   Accessible: ✅

[... continues for all contracts ...]

✅ All contracts verified successfully!
```

### Step 2: Verify on Block Explorer

Automatically verify contracts on Etherscan/Polygonscan:

```bash
# Verify all contracts
npm run verify:all -- --network sepolia

# Or verify individual contracts
npx hardhat verify --network sepolia 0xAbCd...1234
```

---

## Health Monitoring

### Run Health Check

```bash
npm run deploy:health -- --network sepolia
```

The health check performs:
- 🌐 Network connectivity tests
- 👤 Deployer wallet balance checks
- 📦 Contract deployment verification
- ⚙️ Configuration validation
- 🔗 Cross-contract integration tests

**Example Output:**

```
═══════════════════════════════════════════════════════════
🏥 EVOLVERSE Deployment Health Check
═══════════════════════════════════════════════════════════

Network: sepolia
Chain ID: 11155111
Timestamp: 2024-01-15T10:30:00.000Z

🌐 Network Health Checks
─────────────────────────────────────────
   ✅ RPC Connected (Block: 4567890)
   ✅ Gas Price: 25.5 gwei

👤 Deployer Wallet Health
─────────────────────────────────────────
   Address: 0x1234...5678
   Balance: 0.5 ETH
   ✅ Sufficient Balance

📦 Contract Deployment Health
─────────────────────────────────────────
   ✅ BLEULION_CASCADE: 0xAbCd...1234
   ✅ BLEU_WATCHTOWER: 0xEfGh...5678
   [...]

⚙️  Contract Configuration Health
─────────────────────────────────────────
   ✅ CASCADE Owner: 0x1234...5678
   ✅ CASCADE ↔ WATCHTOWER: Linked

═══════════════════════════════════════════════════════════
📊 Health Check Summary
═══════════════════════════════════════════════════════════

   ✅ Healthy: 15/15
   ⚠️  Warnings: 0/15
   ❌ Critical: 0/15

✅ Overall Status: HEALTHY - All systems operational
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Insufficient Funds

```
Error: insufficient funds for gas
```

**Solution:**
- Check deployer wallet balance: `npm run deploy:init -- --network sepolia`
- Send more ETH to the deployer address
- Reduce gas price (edit `hardhat.config.ts`)

#### Issue 2: Nonce Too Low

```
Error: nonce has already been used
```

**Solution:**
- Wait for previous transactions to confirm
- Check pending transactions on block explorer
- Manually set nonce in deployment script if needed

#### Issue 3: Contract Verification Failed

```
Error: contract verification failed
```

**Solution:**
- Ensure API key is correct in `.env`
- Wait 1-2 minutes after deployment before verifying
- Check block explorer website is accessible
- Verify compiler settings match deployment

#### Issue 4: RPC Connection Failed

```
Error: Could not connect to RPC endpoint
```

**Solution:**
- Check RPC URL in `.env` is correct
- Verify API key is valid
- Try alternative RPC provider
- Check internet connectivity

#### Issue 5: Contract Already Deployed

```
Error: contract already deployed at address
```

**Solution:**
- Check `config/network_manifest.json` for existing deployments
- Delete old deployment records if redeploying
- Use fresh deployer address if needed

### Debugging Tips

1. **Enable verbose logging:**
   ```bash
   DEBUG=* npm run deploy:all -- --network sepolia
   ```

2. **Check transaction status:**
   ```bash
   # View on Etherscan
   https://sepolia.etherscan.io/tx/<transaction_hash>
   ```

3. **Review deployment logs:**
   ```bash
   cat deployments/sepolia_latest.json
   ```

4. **Check gas estimation:**
   ```typescript
   const estimatedGas = await contract.estimateGas.deploy();
   console.log("Estimated gas:", estimatedGas.toString());
   ```

---

## Deployment Checklist

Use this checklist for production deployments:

### Pre-Deployment

- [ ] All contracts compiled successfully
- [ ] Tests passing (if available)
- [ ] Security audit completed
- [ ] `.env` file configured with production keys
- [ ] Deployer wallet funded (recommended: 0.5+ ETH)
- [ ] Network configuration verified
- [ ] Block explorer API keys configured
- [ ] Initialization script passed all checks

### During Deployment

- [ ] Deploy to testnet first (sepolia/mumbai/fuji)
- [ ] Verify testnet deployment works correctly
- [ ] Run health checks on testnet
- [ ] Review gas costs
- [ ] Confirm all contracts deployed
- [ ] Verify contracts on block explorer

### Post-Deployment

- [ ] Run verification script
- [ ] Run health check script
- [ ] Verify contracts on block explorer
- [ ] Save deployment manifest securely
- [ ] Transfer ownership if needed
- [ ] Configure roles and permissions
- [ ] Document deployed addresses
- [ ] Update frontend configuration (if applicable)
- [ ] Announce deployment to team/community

---

## Network-Specific Notes

### Sepolia (Testnet)

- **Faucet**: https://sepoliafaucet.com/
- **Explorer**: https://sepolia.etherscan.io/
- **Gas**: Usually cheap, 1-10 gwei

### Mumbai (Polygon Testnet)

- **Faucet**: https://faucet.polygon.technology/
- **Explorer**: https://mumbai.polygonscan.com/
- **Gas**: Very cheap, usually < 1 gwei

### Fuji (Avalanche Testnet)

- **Faucet**: https://faucet.avax.network/
- **Explorer**: https://testnet.snowtrace.io/
- **Gas**: Moderate, 25-50 gwei

### Mainnet Deployment

**⚠️ WARNING: Mainnet deployments are IRREVERSIBLE and cost real money!**

Before mainnet deployment:
- [ ] Test thoroughly on testnet
- [ ] Get security audit
- [ ] Review all code carefully
- [ ] Use hardware wallet for deployer key
- [ ] Double-check all addresses and parameters
- [ ] Have emergency response plan ready

---

## MCP Integration

This repository has **pre-integrated MCP (Model Context Protocol) servers** available:

### GitHub MCP Server
- Monitor deployment CI/CD pipelines
- Track issues and pull requests
- Search codebase
- List workflow runs

### Playwright MCP Server
- Automated UI testing
- Screenshot capture
- Visual verification of deployments

**Note**: MCP servers are already running in the environment - no manual startup required!

See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for detailed usage.

---

## Quick Reference Commands

```bash
# Setup
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env with your credentials

# Pre-deployment
npm run deploy:init -- --network sepolia
npm run compile

# Deployment
npm run deploy:all -- --network sepolia

# Verification
npm run deploy:verify -- --network sepolia
npm run deploy:health -- --network sepolia

# Contract verification on block explorer
npm run verify:all -- --network sepolia
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review deployment logs in `deployments/`
3. Run health check: `npm run deploy:health`
4. Check GitHub issues
5. Contact the development team

---

## License

See [LICENSE](./LICENSE) file for details.

---

**Last Updated**: January 2025  
**Version**: 1.0.0
