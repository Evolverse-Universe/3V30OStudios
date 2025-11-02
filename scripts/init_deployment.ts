import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

/**
 * Deployment Initialization Script
 * 
 * This script performs pre-deployment checks and environment setup:
 * 1. Verifies environment variables are configured
 * 2. Checks deployer wallet balance
 * 3. Verifies RPC endpoint connectivity
 * 4. Validates network configuration
 * 5. Ensures deployment directory structure exists
 */

interface PreflightCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🚀 EVOLVERSE Deployment Initialization");
  console.log("═══════════════════════════════════════════════════════════\n");

  const checks: PreflightCheck[] = [];

  // ==========================================
  // Check 1: Environment Variables
  // ==========================================
  console.log("📋 Check 1: Environment Variables");
  console.log("─────────────────────────────────────────\n");

  const requiredEnvVars = ["PRIVATE_KEY"];
  const optionalEnvVars = [
    "ETHEREUM_RPC_URL",
    "POLYGON_RPC_URL",
    "SEPOLIA_RPC_URL",
    "ETHERSCAN_API_KEY",
    "POLYGONSCAN_API_KEY",
  ];

  let envCheckPass = true;

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.log(`   ❌ Missing required: ${varName}`);
      checks.push({
        name: `ENV: ${varName}`,
        status: "fail",
        message: "Required environment variable not set",
      });
      envCheckPass = false;
    } else {
      console.log(`   ✅ Found: ${varName}`);
      checks.push({
        name: `ENV: ${varName}`,
        status: "pass",
        message: "Environment variable configured",
      });
    }
  }

  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      console.log(`   ⚠️  Optional: ${varName} (not set)`);
      checks.push({
        name: `ENV: ${varName}`,
        status: "warn",
        message: "Optional environment variable not set",
      });
    } else {
      console.log(`   ✅ Found: ${varName}`);
      checks.push({
        name: `ENV: ${varName}`,
        status: "pass",
        message: "Environment variable configured",
      });
    }
  }

  if (!envCheckPass) {
    console.log("\n❌ Environment configuration incomplete!");
    console.log("Please copy .env.example to .env and configure required variables.\n");
    process.exitCode = 1;
    return;
  }

  console.log();

  // ==========================================
  // Check 2: Network Configuration
  // ==========================================
  console.log("🌐 Check 2: Network Configuration");
  console.log("─────────────────────────────────────────\n");

  console.log(`   Current Network: ${network.name}`);
  console.log(`   Chain ID: ${network.config.chainId}`);

  if (network.name === "hardhat" || network.name === "localhost") {
    console.log("   ⚠️  Using local network (development mode)");
    checks.push({
      name: "Network",
      status: "warn",
      message: "Using local development network",
    });
  } else {
    console.log("   ✅ Using live network");
    checks.push({
      name: "Network",
      status: "pass",
      message: `Connected to ${network.name}`,
    });
  }

  console.log();

  // ==========================================
  // Check 3: RPC Connectivity
  // ==========================================
  console.log("🔌 Check 3: RPC Connectivity");
  console.log("─────────────────────────────────────────\n");

  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`   ✅ Connected to RPC`);
    console.log(`   Latest Block: ${blockNumber}`);
    checks.push({
      name: "RPC Connectivity",
      status: "pass",
      message: `Connected, latest block: ${blockNumber}`,
    });
  } catch (error) {
    console.log(`   ❌ Failed to connect to RPC`);
    console.log(`   Error: ${error}`);
    checks.push({
      name: "RPC Connectivity",
      status: "fail",
      message: "Could not connect to RPC endpoint",
    });
    process.exitCode = 1;
    return;
  }

  console.log();

  // ==========================================
  // Check 4: Deployer Wallet
  // ==========================================
  console.log("👤 Check 4: Deployer Wallet");
  console.log("─────────────────────────────────────────\n");

  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);

    console.log(`   Address: ${deployer.address}`);
    console.log(`   Balance: ${balanceEth} ETH`);

    const minBalance = 0.01; // Minimum 0.01 ETH recommended

    if (parseFloat(balanceEth) < minBalance) {
      console.log(`   ⚠️  Low balance (< ${minBalance} ETH)`);
      checks.push({
        name: "Deployer Balance",
        status: "warn",
        message: `Balance is ${balanceEth} ETH (below recommended ${minBalance} ETH)`,
      });
    } else {
      console.log(`   ✅ Sufficient balance`);
      checks.push({
        name: "Deployer Balance",
        status: "pass",
        message: `Balance: ${balanceEth} ETH`,
      });
    }
  } catch (error) {
    console.log(`   ❌ Failed to get deployer info`);
    console.log(`   Error: ${error}`);
    checks.push({
      name: "Deployer Wallet",
      status: "fail",
      message: "Could not access deployer wallet",
    });
    process.exitCode = 1;
    return;
  }

  console.log();

  // ==========================================
  // Check 5: Directory Structure
  // ==========================================
  console.log("📁 Check 5: Directory Structure");
  console.log("─────────────────────────────────────────\n");

  const requiredDirs = ["config", "deployments", "contracts", "scripts"];

  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, "..", dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   ✅ ${dir}/`);
      checks.push({
        name: `Directory: ${dir}`,
        status: "pass",
        message: "Directory exists",
      });
    } else {
      console.log(`   🔧 Creating ${dir}/`);
      fs.mkdirSync(dirPath, { recursive: true });
      checks.push({
        name: `Directory: ${dir}`,
        status: "warn",
        message: "Directory created",
      });
    }
  }

  console.log();

  // ==========================================
  // Check 6: Manifest File
  // ==========================================
  console.log("📄 Check 6: Deployment Manifest");
  console.log("─────────────────────────────────────────\n");

  const manifestPath = path.join(__dirname, "..", "config", "network_manifest.json");

  if (fs.existsSync(manifestPath)) {
    console.log(`   ✅ Manifest file exists`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const networkCount = Object.keys(manifest.networks || {}).length;
    console.log(`   Networks configured: ${networkCount}`);
    checks.push({
      name: "Deployment Manifest",
      status: "pass",
      message: `Manifest exists with ${networkCount} networks`,
    });
  } else {
    console.log(`   🔧 Creating manifest file`);
    const emptyManifest = { networks: {} };
    fs.writeFileSync(manifestPath, JSON.stringify(emptyManifest, null, 2));
    checks.push({
      name: "Deployment Manifest",
      status: "warn",
      message: "Manifest file created",
    });
  }

  console.log();

  // ==========================================
  // Summary
  // ==========================================
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📊 Pre-flight Check Summary");
  console.log("═══════════════════════════════════════════════════════════\n");

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ⚠️  Warnings: ${warnCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  console.log();

  if (failCount > 0) {
    console.log("❌ Initialization failed. Please fix the issues above.\n");
    process.exitCode = 1;
  } else if (warnCount > 0) {
    console.log("⚠️  Initialization completed with warnings.");
    console.log("   Review warnings before proceeding to deployment.\n");
  } else {
    console.log("✅ All checks passed! Ready for deployment.\n");
  }

  // Save check results
  const checkReportPath = path.join(
    __dirname,
    "..",
    "deployments",
    `init_check_${network.name}_${Date.now()}.json`
  );

  fs.writeFileSync(
    checkReportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        network: network.name,
        chainId: network.config.chainId,
        checks,
        summary: {
          pass: passCount,
          warn: warnCount,
          fail: failCount,
        },
      },
      null,
      2
    )
  );

  console.log(`   Report saved: ${checkReportPath}\n`);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎯 Next Steps:");
  console.log("   1. Run: npm run compile");
  console.log("   2. Run: npm run deploy:cascade -- --network <network>");
  console.log("   3. Run: npm run deploy:all -- --network <network>");
  console.log("   4. Run: npm run deploy:verify");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error("❌ Initialization script failed:", error);
  process.exitCode = 1;
});
