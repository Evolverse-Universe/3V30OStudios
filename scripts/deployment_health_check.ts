import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { loadManifest } from "./utils/manifest";

dotenv.config();

/**
 * Deployment Health Check Script
 * 
 * Comprehensive health check for deployed contracts including:
 * - Contract accessibility
 * - Balance checks
 * - Configuration validation
 * - Cross-contract integration tests
 * - Event log verification
 */

interface HealthCheckResult {
  category: string;
  check: string;
  status: "healthy" | "warning" | "critical";
  message: string;
  details?: any;
}

class HealthChecker {
  private results: HealthCheckResult[] = [];

  addResult(
    category: string,
    check: string,
    status: "healthy" | "warning" | "critical",
    message: string,
    details?: any
  ) {
    this.results.push({ category, check, status, message, details });
  }

  getResults(): HealthCheckResult[] {
    return this.results;
  }

  getSummary() {
    return {
      healthy: this.results.filter((r) => r.status === "healthy").length,
      warning: this.results.filter((r) => r.status === "warning").length,
      critical: this.results.filter((r) => r.status === "critical").length,
      total: this.results.length,
    };
  }
}

async function checkNetworkHealth(checker: HealthChecker) {
  console.log("🌐 Network Health Checks");
  console.log("─────────────────────────────────────────\n");

  try {
    // Check RPC connectivity
    const blockNumber = await ethers.provider.getBlockNumber();
    checker.addResult(
      "Network",
      "RPC Connectivity",
      "healthy",
      "Successfully connected to RPC",
      { blockNumber }
    );
    console.log(`   ✅ RPC Connected (Block: ${blockNumber})`);

    // Check network gas prices
    const feeData = await ethers.provider.getFeeData();
    const gasPriceGwei = ethers.formatUnits(feeData.gasPrice || 0, "gwei");
    const gasPriceNum = parseFloat(gasPriceGwei);

    if (gasPriceNum > 100) {
      checker.addResult(
        "Network",
        "Gas Price",
        "warning",
        `Gas price is high: ${gasPriceGwei} gwei`,
        { gasPrice: gasPriceGwei }
      );
      console.log(`   ⚠️  Gas Price: ${gasPriceGwei} gwei (HIGH)`);
    } else {
      checker.addResult(
        "Network",
        "Gas Price",
        "healthy",
        `Gas price is normal: ${gasPriceGwei} gwei`,
        { gasPrice: gasPriceGwei }
      );
      console.log(`   ✅ Gas Price: ${gasPriceGwei} gwei`);
    }
  } catch (error) {
    checker.addResult(
      "Network",
      "RPC Connectivity",
      "critical",
      `Failed to connect to RPC: ${error}`
    );
    console.log(`   ❌ RPC Connection Failed: ${error}`);
  }

  console.log();
}

async function checkDeployerWallet(checker: HealthChecker) {
  console.log("👤 Deployer Wallet Health");
  console.log("─────────────────────────────────────────\n");

  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);

    console.log(`   Address: ${deployer.address}`);
    console.log(`   Balance: ${balanceEth} ETH`);

    const minBalance = 0.01;
    const balanceNum = parseFloat(balanceEth);

    if (balanceNum < minBalance) {
      checker.addResult(
        "Wallet",
        "Balance",
        "warning",
        `Deployer balance is low: ${balanceEth} ETH`,
        { address: deployer.address, balance: balanceEth }
      );
      console.log(`   ⚠️  Low Balance (< ${minBalance} ETH)`);
    } else {
      checker.addResult(
        "Wallet",
        "Balance",
        "healthy",
        `Deployer balance is sufficient: ${balanceEth} ETH`,
        { address: deployer.address, balance: balanceEth }
      );
      console.log(`   ✅ Sufficient Balance`);
    }
  } catch (error) {
    checker.addResult(
      "Wallet",
      "Access",
      "critical",
      `Cannot access deployer wallet: ${error}`
    );
    console.log(`   ❌ Wallet Access Failed: ${error}`);
  }

  console.log();
}

async function checkContractDeployments(
  checker: HealthChecker,
  deployments: { [key: string]: string }
) {
  console.log("📦 Contract Deployment Health");
  console.log("─────────────────────────────────────────\n");

  for (const [name, address] of Object.entries(deployments)) {
    try {
      const code = await ethers.provider.getCode(address);

      if (code === "0x") {
        checker.addResult(
          "Contracts",
          name,
          "critical",
          `Contract ${name} not found at address ${address}`
        );
        console.log(`   ❌ ${name}: Not deployed`);
      } else {
        checker.addResult(
          "Contracts",
          name,
          "healthy",
          `Contract ${name} is deployed`,
          { address, bytecodeLength: code.length }
        );
        console.log(`   ✅ ${name}: ${address}`);
      }
    } catch (error) {
      checker.addResult(
        "Contracts",
        name,
        "critical",
        `Failed to check contract ${name}: ${error}`
      );
      console.log(`   ❌ ${name}: Check failed`);
    }
  }

  console.log();
}

async function checkContractConfigurations(
  checker: HealthChecker,
  deployments: { [key: string]: string }
) {
  console.log("⚙️  Contract Configuration Health");
  console.log("─────────────────────────────────────────\n");

  // Check CASCADE configuration
  if (deployments.BLEULION_CASCADE) {
    try {
      const cascade = await ethers.getContractAt(
        "BLEULION_CASCADE",
        deployments.BLEULION_CASCADE
      );

      // Try to check owner if the function exists
      try {
        const owner = await (cascade as any).owner();
        checker.addResult(
          "Configuration",
          "CASCADE Owner",
          "healthy",
          `CASCADE owner configured: ${owner}`,
          { owner }
        );
        console.log(`   ✅ CASCADE Owner: ${owner}`);
      } catch {
        checker.addResult(
          "Configuration",
          "CASCADE Owner",
          "warning",
          "Cannot verify CASCADE owner (method may not exist)"
        );
        console.log(`   ⚠️  CASCADE Owner: Not verifiable`);
      }

      // Try to check watchtower link
      if (deployments.BLEU_WATCHTOWER) {
        try {
          const watchtowerAddr = await (cascade as any).watchtower();
          if (
            watchtowerAddr.toLowerCase() ===
            deployments.BLEU_WATCHTOWER.toLowerCase()
          ) {
            checker.addResult(
              "Configuration",
              "CASCADE-WATCHTOWER Link",
              "healthy",
              "CASCADE correctly linked to WATCHTOWER"
            );
            console.log(`   ✅ CASCADE ↔ WATCHTOWER: Linked`);
          } else {
            checker.addResult(
              "Configuration",
              "CASCADE-WATCHTOWER Link",
              "warning",
              "CASCADE watchtower address mismatch"
            );
            console.log(`   ⚠️  CASCADE ↔ WATCHTOWER: Mismatch`);
          }
        } catch {
          checker.addResult(
            "Configuration",
            "CASCADE-WATCHTOWER Link",
            "warning",
            "Cannot verify CASCADE-WATCHTOWER link"
          );
          console.log(`   ⚠️  CASCADE ↔ WATCHTOWER: Not verifiable`);
        }
      }
    } catch (error) {
      checker.addResult(
        "Configuration",
        "CASCADE",
        "critical",
        `Cannot access CASCADE contract: ${error}`
      );
      console.log(`   ❌ CASCADE: Access failed`);
    }
  }

  console.log();
}

async function checkEnvironmentConfiguration(checker: HealthChecker) {
  console.log("🔐 Environment Configuration Health");
  console.log("─────────────────────────────────────────\n");

  const requiredVars = ["PRIVATE_KEY"];
  const recommendedVars = [
    `${network.name.toUpperCase()}_RPC_URL`,
    "ETHERSCAN_API_KEY",
    "POLYGONSCAN_API_KEY",
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      checker.addResult(
        "Environment",
        varName,
        "healthy",
        `${varName} is configured`
      );
      console.log(`   ✅ ${varName}: Configured`);
    } else {
      checker.addResult(
        "Environment",
        varName,
        "critical",
        `${varName} is not configured`
      );
      console.log(`   ❌ ${varName}: Missing`);
    }
  }

  for (const varName of recommendedVars) {
    if (process.env[varName]) {
      checker.addResult(
        "Environment",
        varName,
        "healthy",
        `${varName} is configured`
      );
      console.log(`   ✅ ${varName}: Configured`);
    } else {
      checker.addResult(
        "Environment",
        varName,
        "warning",
        `${varName} is not configured (recommended)`
      );
      console.log(`   ⚠️  ${varName}: Not set (recommended)`);
    }
  }

  console.log();
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🏥 EVOLVERSE Deployment Health Check");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const checker = new HealthChecker();

  // Run all health checks
  await checkNetworkHealth(checker);
  await checkDeployerWallet(checker);
  await checkEnvironmentConfiguration(checker);

  // Load and check deployments
  const manifest = await loadManifest();
  const networkEntry = manifest.networks[network.name];

  if (!networkEntry) {
    console.log("⚠️  No deployments found for this network.\n");
    checker.addResult(
      "Deployments",
      "Manifest",
      "warning",
      "No deployments found in manifest"
    );
  } else {
    await checkContractDeployments(checker, networkEntry.deployments);
    await checkContractConfigurations(checker, networkEntry.deployments);
  }

  // ==========================================
  // Generate Summary
  // ==========================================
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📊 Health Check Summary");
  console.log("═══════════════════════════════════════════════════════════\n");

  const summary = checker.getSummary();

  console.log(`   ✅ Healthy: ${summary.healthy}/${summary.total}`);
  console.log(`   ⚠️  Warnings: ${summary.warning}/${summary.total}`);
  console.log(`   ❌ Critical: ${summary.critical}/${summary.total}`);

  console.log();

  // Determine overall health status
  let overallStatus: "healthy" | "degraded" | "critical";
  if (summary.critical > 0) {
    overallStatus = "critical";
    console.log("🚨 Overall Status: CRITICAL - Immediate attention required\n");
  } else if (summary.warning > 0) {
    overallStatus = "degraded";
    console.log("⚠️  Overall Status: DEGRADED - Some issues need attention\n");
  } else {
    overallStatus = "healthy";
    console.log("✅ Overall Status: HEALTHY - All systems operational\n");
  }

  // Save health check report
  const reportPath = path.join(
    __dirname,
    "..",
    "deployments",
    `health_check_${network.name}_${Date.now()}.json`
  );

  const report = {
    timestamp: new Date().toISOString(),
    network: network.name,
    chainId: network.config.chainId,
    overallStatus,
    summary,
    results: checker.getResults(),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`   Report saved: ${reportPath}\n`);

  console.log("═══════════════════════════════════════════════════════════\n");

  // Set exit code based on health
  if (overallStatus === "critical") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Health check failed:", error);
  process.exitCode = 1;
});
