import { Contract } from "ethers";

/**
 * Type definitions for common contract methods
 * These interfaces provide type safety for contract interactions
 * without requiring full contract ABI imports
 */

export interface OwnableContract extends Contract {
  owner(): Promise<string>;
}

export interface CascadeContract extends Contract {
  owner(): Promise<string>;
  watchtower(): Promise<string>;
  setWatchtower(address: string): Promise<any>;
}

export interface WatchtowerContract extends Contract {
  cascade(): Promise<string>;
}

export interface GovernanceContract extends Contract {
  owner(): Promise<string>;
  cascade(): Promise<string>;
  watchtower(): Promise<string>;
}

/**
 * Type guard to check if a contract has an owner method
 */
export function hasOwner(contract: Contract): contract is OwnableContract {
  return "owner" in contract && typeof (contract as any).owner === "function";
}

/**
 * Type guard to check if a contract is a CASCADE contract
 */
export function isCascadeContract(contract: Contract): contract is CascadeContract {
  return (
    "watchtower" in contract &&
    typeof (contract as any).watchtower === "function" &&
    "setWatchtower" in contract &&
    typeof (contract as any).setWatchtower === "function"
  );
}

/**
 * Safe method to get contract owner if it exists
 */
export async function safeGetOwner(contract: Contract): Promise<string | undefined> {
  try {
    if (hasOwner(contract)) {
      return await contract.owner();
    }
  } catch (error) {
    // Method doesn't exist or call failed
  }
  return undefined;
}

/**
 * Safe method to get watchtower address from CASCADE if it exists
 */
export async function safeGetWatchtower(
  contract: Contract
): Promise<string | undefined> {
  try {
    if (isCascadeContract(contract)) {
      return await contract.watchtower();
    }
  } catch (error) {
    // Method doesn't exist or call failed
  }
  return undefined;
}
