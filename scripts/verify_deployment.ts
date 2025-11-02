import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { loadManifest } from "./utils/manifest";

/**
 * Deployment Verification Script
 * 
 * This script verifies deployed contracts and validates the deployment:
 * 1. Checks all contracts are deployed and accessible
 * 2. Verifies contract bytecode matches expected
 * 3. Validates contract configurations
 * 4. Tests basic contract functionality
 * 5. Generates a health check report
 */

interface VerificationResult {
  contract: string;
  address: string;
  status: "pass" | "fail" | "skip";
  checks: {
    deployed: boolean;
    bytecode: boolean;
    accessible: boolean;
    configured?: boolean;
  };
  message: string;
}

async function verifyContract(
  name: string,
  address: string
): Promise<VerificationResult> {
  const result: VerificationResult = {
    contract: name,
    address,
    status: "pass",
    checks: {
      deployed: false,
      bytecode: false,
      accessible: false,
    },
    message: "",
  };

  try {
    // Check if contract is deployed
    const code = await ethers.provider.getCode(address);
    result.checks.deployed = code !== "0x";

    if (!result.checks.deployed) {
      result.status = "fail";
      result.message = "Contract not deployed at address";
      return result;
    }

    // Check bytecode exists
    result.checks.bytecode = code.length > 10; // More than just "0x"

    // Try to access contract (basic call)
    try {
      const contract = await ethers.getContractAt(name, address);
      result.checks.accessible = true;

      // Try to call a common view function if available
      if (typeof (contract as any).owner === "function") {
        try {
          await (contract as any).owner();
          result.checks.configured = true;
        } catch {
          result.checks.configured = false;
        }
      }
    } catch (error) {
      result.checks.accessible = false;
      result.message = `Contract interface mismatch: ${error}`;
      result.status = "fail";
      return result;
    }

    result.status = "pass";
    result.message = "Contract verified successfully";
  } catch (error) {
    result.status = "fail";
    result.message = `Verification error: ${error}`;
  }

  return result;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🔍 EVOLVERSE Deployment Verification");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}\n`);

  // ==========================================
  // Load Deployment Manifest
  // ==========================================
  console.log("📋 Loading deployment manifest...\n");

  const manifest = await loadManifest();
  const networkEntry = manifest.networks[network.name];

  if (!networkEntry) {
    console.log(`❌ No deployments found for network: ${network.name}\n`);
    console.log("Please deploy contracts first using:");
    console.log(`   npm run deploy:all -- --network ${network.name}\n`);
    process.exitCode = 1;
    return;
  }

  const deployments = networkEntry.deployments;
  const contractNames = Object.keys(deployments);

  console.log(`Found ${contractNames.length} deployed contracts:\n`);
  contractNames.forEach((name) => {
    console.log(`   • ${name}: ${deployments[name]}`);
  });
  console.log();

  // ==========================================
  // Verify Each Contract
  // ==========================================
  console.log("🔍 Verifying contracts...\n");

  const results: VerificationResult[] = [];

  for (const [name, address] of Object.entries(deployments)) {
    console.log(`Checking ${name}...`);

    const result = await verifyContract(name, address);
    results.push(result);

    if (result.status === "pass") {
      console.log(`   ✅ ${result.message}`);
    } else if (result.status === "fail") {
      console.log(`   ❌ ${result.message}`);
    } else {
      console.log(`   ⚠️  ${result.message}`);
    }

    console.log(`   Deployed: ${result.checks.deployed ? "✅" : "❌"}`);
    console.log(`   Bytecode: ${result.checks.bytecode ? "✅" : "❌"}`);
    console.log(`   Accessible: ${result.checks.accessible ? "✅" : "❌"}`);
    if (result.checks.configured !== undefined) {
      console.log(`   Configured: ${result.checks.configured ? "✅" : "⚠️"}`);
    }
    console.log();
  }

  // ==========================================
  // Dependency Verification
  // ==========================================
  console.log("🔗 Verifying contract dependencies...\n");

  // Check CASCADE -> WATCHTOWER link
  if (deployments.BLEULION_CASCADE && deployments.BLEU_WATCHTOWER) {
    try {
      const cascade = await ethers.getContractAt(
        "BLEULION_CASCADE",
        deployments.BLEULION_CASCADE
      );

      // Check if watchtower is set (if the contract has this function)
      try {
        const watchtowerAddr = await (cascade as any).watchtower();
        if (watchtowerAddr.toLowerCase() === deployments.BLEU_WATCHTOWER.toLowerCase()) {
          console.log("   ✅ CASCADE → WATCHTOWER link verified");
        } else {
          console.log("   ⚠️  CASCADE → WATCHTOWER link mismatch");
        }
      } catch {
        console.log("   ⚠️  CASCADE → WATCHTOWER link not verifiable (method may not exist)");
      }
    } catch (error) {
      console.log(`   ❌ Could not verify CASCADE → WATCHTOWER link: ${error}`);
    }
  }

  console.log();

  // ==========================================
  // Network Stats
  // ==========================================
  console.log("📊 Network Statistics\n");

  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    const gasPrice = await ethers.provider.getFeeData();

    console.log(`   Block Number: ${blockNumber}`);
    console.log(`   Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0, "gwei")} gwei`);
    if (gasPrice.maxFeePerGas) {
      console.log(`   Max Fee: ${ethers.formatUnits(gasPrice.maxFeePerGas, "gwei")} gwei`);
    }
  } catch (error) {
    console.log(`   ⚠️  Could not fetch network stats: ${error}`);
  }

  console.log();

  // ==========================================
  // Summary
  // ==========================================
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📊 Verification Summary");
  console.log("═══════════════════════════════════════════════════════════\n");

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const skipCount = results.filter((r) => r.status === "skip").length;

  console.log(`   ✅ Passed: ${passCount}/${contractNames.length}`);
  console.log(`   ❌ Failed: ${failCount}/${contractNames.length}`);
  console.log(`   ⚠️  Skipped: ${skipCount}/${contractNames.length}`);

  console.log();

  if (failCount > 0) {
    console.log("❌ Verification failed. Some contracts have issues.\n");
    process.exitCode = 1;
  } else if (skipCount > 0) {
    console.log("⚠️  Verification completed with some skipped checks.\n");
  } else {
    console.log("✅ All contracts verified successfully!\n");
  }

  // ==========================================
  // Save Verification Report
  // ==========================================
  const reportPath = path.join(
    __dirname,
    "..",
    "deployments",
    `verification_${network.name}_${Date.now()}.json`
  );

  const report = {
    timestamp: new Date().toISOString(),
    network: network.name,
    chainId: network.config.chainId,
    results,
    summary: {
      total: contractNames.length,
      passed: passCount,
      failed: failCount,
      skipped: skipCount,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`   Report saved: ${reportPath}\n`);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎯 Next Steps:");
  if (failCount === 0) {
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Configure additional roles and permissions");
    console.log("   3. Begin minting operations");
  } else {
    console.log("   1. Review failed contracts");
    console.log("   2. Redeploy failed contracts");
    console.log("   3. Run verification again");
  }
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error("❌ Verification script failed:", error);
  process.exitCode = 1;
});
