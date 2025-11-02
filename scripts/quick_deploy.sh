#!/bin/bash

# EVOLVERSE Quick Deployment Script
# This script automates the entire deployment process with interactive prompts

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "🚀 EVOLVERSE Quick Deployment Automation"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your credentials before proceeding!${NC}"
    echo ""
    read -p "Press Enter after you've configured .env, or Ctrl+C to exit..."
fi

# Ask for network
echo ""
echo "Select deployment network:"
echo "  1) Sepolia (Ethereum Testnet)"
echo "  2) Mumbai (Polygon Testnet)"
echo "  3) Fuji (Avalanche Testnet)"
echo "  4) Mainnet (Ethereum) - ⚠️  USE WITH CAUTION"
echo "  5) Polygon (Mainnet) - ⚠️  USE WITH CAUTION"
echo "  6) Avalanche (Mainnet) - ⚠️  USE WITH CAUTION"
echo "  7) Custom network"
echo ""
read -p "Enter choice [1-7]: " network_choice

case $network_choice in
    1)
        NETWORK="sepolia"
        ;;
    2)
        NETWORK="mumbai"
        ;;
    3)
        NETWORK="fuji"
        ;;
    4)
        NETWORK="mainnet"
        echo -e "${RED}⚠️  WARNING: You selected MAINNET! This will cost real money!${NC}"
        read -p "Are you absolutely sure? Type 'YES' to confirm: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Deployment cancelled."
            exit 1
        fi
        ;;
    5)
        NETWORK="polygon"
        echo -e "${RED}⚠️  WARNING: You selected MAINNET! This will cost real money!${NC}"
        read -p "Are you absolutely sure? Type 'YES' to confirm: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Deployment cancelled."
            exit 1
        fi
        ;;
    6)
        NETWORK="avalanche"
        echo -e "${RED}⚠️  WARNING: You selected MAINNET! This will cost real money!${NC}"
        read -p "Are you absolutely sure? Type 'YES' to confirm: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Deployment cancelled."
            exit 1
        fi
        ;;
    7)
        read -p "Enter custom network name: " NETWORK
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Selected network: ${NETWORK}${NC}"
echo ""

# Step 1: Check dependencies
echo -e "${BLUE}Step 1/6: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    # Using --legacy-peer-deps to resolve ethers v5 compatibility with older hardhat plugins
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Run initialization checks
echo -e "${BLUE}Step 2/6: Running pre-flight checks...${NC}"
npm run deploy:init -- --network $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Pre-flight checks failed!${NC}"
    echo "Please fix the issues above before deploying."
    exit 1
fi
echo ""

# Step 3: Compile contracts
echo -e "${BLUE}Step 3/6: Compiling contracts...${NC}"
npm run compile

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Compilation failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
echo ""

# Step 4: Deploy contracts
echo -e "${BLUE}Step 4/6: Deploying contracts...${NC}"
echo "This may take several minutes. Please wait..."
echo ""

npm run deploy:all -- --network $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
echo ""

# Step 5: Verify deployment
echo -e "${BLUE}Step 5/6: Verifying deployment...${NC}"
npm run deploy:verify -- --network $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Verification checks failed!${NC}"
    echo "Some contracts may not be deployed correctly."
fi
echo ""

# Step 6: Health check
echo -e "${BLUE}Step 6/6: Running health check...${NC}"
npm run deploy:health -- --network $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Health check found issues!${NC}"
    echo "Review the output above for details."
fi
echo ""

# Summary
echo -e "${GREEN}"
echo "═══════════════════════════════════════════════════════════"
echo "✅ Deployment Complete!"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""
echo "Deployment records saved in:"
echo "  • deployments/${NETWORK}_latest.json"
echo "  • config/network_manifest.json"
echo ""
echo "Next steps:"
echo "  1. Verify contracts on block explorer"
echo "  2. Configure additional permissions"
echo "  3. Begin minting operations"
echo ""
echo -e "${BLUE}Thank you for using EVOLVERSE deployment automation!${NC}"
