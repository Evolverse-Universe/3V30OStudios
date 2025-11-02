# MCP Integration Guide

## Overview

This repository is equipped with **Model Context Protocol (MCP)** integration for automated deployment, testing, and repository management. The MCP servers are pre-integrated and available as tools within the development environment.

## Available MCP Servers

### 1. GitHub MCP Server
**Status**: ✅ Already Running

The GitHub MCP server provides direct integration with GitHub's API, enabling:

- **Repository Operations**: Read files, list branches, search code
- **Issue & PR Management**: List, search, and read issues and pull requests
- **Workflow Automation**: Monitor CI/CD runs, download logs, analyze failures
- **Code Search**: Fast code search across repositories
- **Release Management**: List and manage releases

**Usage Examples**:
```bash
# These tools are available directly in the environment:
# - github-mcp-server-get_file_contents
# - github-mcp-server-list_commits
# - github-mcp-server-list_workflow_runs
# - github-mcp-server-search_code
# And many more...
```

### 2. Playwright MCP Server
**Status**: ✅ Already Running

The Playwright MCP server enables browser automation for:

- **End-to-End Testing**: Automated UI testing
- **Deployment Verification**: Visual confirmation of deployed applications
- **Screenshot Capture**: Automated documentation of UI states
- **Form Automation**: Automated contract interaction testing

**Usage Examples**:
```bash
# These tools are available directly in the environment:
# - playwright-browser_navigate
# - playwright-browser_click
# - playwright-browser_snapshot
# - playwright-browser_take_screenshot
# And many more...
```

## Deployment Automation Architecture

### Initialization Process

The deployment automation system follows this workflow:

```
┌─────────────────────────────────────────┐
│  1. Environment Setup                   │
│     - Load .env configuration           │
│     - Verify RPC endpoints              │
│     - Check deployer balance            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  2. Pre-Deployment Checks               │
│     - Compile contracts                 │
│     - Run security analysis             │
│     - Verify network configuration      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  3. Contract Deployment                 │
│     - CASCADE (root contract)           │
│     - WATCHTOWER (monitoring)           │
│     - GOV_SCROLL (governance)           │
│     - Token contracts (BLEU, EV0L)      │
│     - Utility contracts                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  4. Post-Deployment                     │
│     - Record addresses to manifest      │
│     - Verify contracts on explorer      │
│     - Configure roles & permissions     │
│     - Health check validation           │
└─────────────────────────────────────────┘
```

### Network Configuration

Supported networks are configured in `hardhat.config.ts`:

**Mainnets:**
- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)
- Avalanche (Chain ID: 43114)
- BSC (Chain ID: 56)
- Cronos (Chain ID: 25)

**Testnets:**
- Sepolia (Chain ID: 11155111)
- Mumbai (Chain ID: 80001)
- Fuji (Chain ID: 43113)

**Local:**
- Hardhat (Chain ID: 31337)
- Localhost (Chain ID: 31337)

### Deployment Scripts

| Script | Purpose | Dependencies |
|--------|---------|--------------|
| `deploy_cascade.ts` | Deploy CASCADE root contract | None |
| `deploy_all_contracts.ts` | Full deployment suite | CASCADE → WATCHTOWER → GOV_SCROLL |
| `deploy_governance.ts` | Governance contracts only | CASCADE |
| `deploy_treasury.ts` | Treasury management | CASCADE, GOV_SCROLL |

### Environment Variables

Required variables (see `.env.example`):

```bash
# Deployer credentials
PRIVATE_KEY=your_private_key_here

# RPC endpoints
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Block explorer API keys (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

### Verification Setup

Contract verification is automated via `@nomiclabs/hardhat-etherscan` plugin:

```typescript
// Configured in hardhat.config.ts
etherscan: {
  apiKey: {
    mainnet: process.env.ETHERSCAN_API_KEY || "",
    polygon: process.env.POLYGONSCAN_API_KEY || "",
    avalanche: process.env.SNOWTRACE_API_KEY || "",
    // ... more networks
  }
}
```

After deployment, verify contracts with:
```bash
npx hardhat verify --network <network> <contract_address> <constructor_args>
```

Or use the automated verification script:
```bash
npm run verify:all
```

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. Initialize Deployment

```bash
# Run the initialization script
npm run init:deploy

# Or manually:
npm run compile
npm run deploy:all -- --network sepolia
```

### 3. Verify Deployment

```bash
# Check deployment manifest
cat config/network_manifest.json

# Run health check
npm run deploy:verify
```

## Deployment Manifest

All deployments are recorded in `config/network_manifest.json`:

```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "deployments": {
        "BLEULION_CASCADE": "0x...",
        "BLEU_WATCHTOWER": "0x...",
        "BLEU_GOV_SCROLL": "0x..."
      },
      "vaults": {},
      "scrolls": {}
    }
  }
}
```

Additional timestamped manifests are saved in `deployments/` directory.

## Security Considerations

### Private Key Safety
- **NEVER** commit `.env` files to version control
- Use hardware wallets for mainnet deployments
- Rotate keys regularly
- Use separate keys for testnet and mainnet

### Pre-Deployment Checklist
- [ ] Contracts compiled successfully
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas estimation performed
- [ ] Sufficient ETH balance for deployment
- [ ] Network configuration verified
- [ ] Block explorer API keys configured

### Post-Deployment Verification
- [ ] Contracts verified on block explorer
- [ ] Deployment addresses recorded
- [ ] Ownership transferred (if applicable)
- [ ] Roles and permissions configured
- [ ] Health check passed

## Troubleshooting

### Common Issues

**Issue**: `Error: insufficient funds for gas`
- **Solution**: Ensure deployer wallet has sufficient native token balance

**Issue**: `Error: nonce has already been used`
- **Solution**: Wait for previous transaction to confirm or reset nonce

**Issue**: `Error: contract verification failed`
- **Solution**: Verify API key is correct and contract bytecode matches

### Getting Help

For deployment issues:
1. Check `deployments/*.json` for deployment history
2. Review Hardhat logs in console
3. Verify network connectivity to RPC endpoints
4. Consult the community documentation

## Advanced Usage

### Custom Deployment Script

Create custom deployment scripts in `scripts/`:

```typescript
import { ethers, network } from "hardhat";
import { recordDeployment } from "./utils/manifest";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Your deployment logic here
  const contract = await ethers.deployContract("YourContract");
  await contract.waitForDeployment();
  
  // Record to manifest
  await recordDeployment(network.name, network.config.chainId, {
    YourContract: await contract.getAddress()
  });
}

main().catch(console.error);
```

### Multi-Network Deployment

Deploy to multiple networks in sequence:

```bash
# Deploy to all testnets
npm run deploy:all -- --network sepolia
npm run deploy:all -- --network mumbai
npm run deploy:all -- --network fuji

# Deploy to all mainnets (use with caution!)
npm run deploy:all -- --network mainnet
npm run deploy:all -- --network polygon
npm run deploy:all -- --network avalanche
```

## MCP Tool Integration Examples

### Example 1: Automated Deployment Monitoring

Use GitHub MCP tools to monitor deployment CI/CD:

```javascript
// This happens automatically in the environment
// You can query workflow runs, job logs, and failures
```

### Example 2: Visual Verification with Playwright

Use Playwright MCP tools to verify deployed dApps:

```javascript
// Navigate to deployed dApp
// Take screenshots for documentation
// Verify UI elements are correct
```

## Summary

This repository is fully equipped for automated deployment with:

✅ **Pre-integrated MCP servers** (GitHub + Playwright)  
✅ **Comprehensive deployment scripts** (cascade → governance → treasury)  
✅ **Multi-network support** (Ethereum, Polygon, Avalanche, etc.)  
✅ **Automated verification** (via Etherscan API)  
✅ **Safe environment handling** (`.env` + `.env.example`)  
✅ **Deployment manifest tracking** (`config/network_manifest.json`)  
✅ **Health check validation** (coming in next scripts)

The MCP servers are **already running** and accessible as integrated tools - no manual startup required!
