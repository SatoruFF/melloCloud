import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id configuration for secure password hashing
 * 
 * Argon2id - Password Hashing Competition (2015) winner
 * OWASP recommended as the best algorithm for passwords
 * 
 * Advantages:
 * - Protection against side-channel attacks
 * - Best protection against GPU/ASIC attacks  
 * - Flexible memory and time configuration
 * - Modern standard (RFC 9106)
 * 
 * @node-rs/argon2 - native Rust binding, very fast and secure
 */

const ARGON2_CONFIG = {
  // memoryCost: 64 MiB (65536 KiB)
  memoryCost: 65536,
  // timeCost: 3 iterations (speed/security balance)
  timeCost: 3,
  // parallelism: 4 threads
  parallelism: 4,
  // outputLen: 32 bytes (256 bits)
  outputLen: 32,
};

/**
 * Hashes password using Argon2id
 * 
 * @param password - Plain text password
 * @returns String in Argon2 format (includes salt, parameters and hash)
 * 
 * Format: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: ARGON2_CONFIG.memoryCost,
    timeCost: ARGON2_CONFIG.timeCost,
    parallelism: ARGON2_CONFIG.parallelism,
    outputLen: ARGON2_CONFIG.outputLen,
  });
}

/**
 * Compares password with hash
 * 
 * @param password - Plain text password to verify
 * @param storedHash - Stored hash in Argon2 format
 * @returns true if password matches
 * 
 * Note: verify() automatically extracts parameters from hash
 * and uses timing-safe comparison
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch (error) {
    // In case of error (e.g. invalid hash format) return false
    return false;
  }
}

/**
 * Checks if password needs rehashing (e.g. after parameter update)
 * 
 * @param storedHash - Stored hash
 * @returns true if parameters are outdated and rehashing is needed
 */
export function needsRehash(storedHash: string): boolean {
  try {
    // Parse parameters from hash
    const match = storedHash.match(/\$argon2id?\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$/);
    if (!match) return true;

    const [, version, m, t, p] = match;
    
    // Check if parameters match current config
    return (
      Number.parseInt(m) !== ARGON2_CONFIG.memoryCost ||
      Number.parseInt(t) !== ARGON2_CONFIG.timeCost ||
      Number.parseInt(p) !== ARGON2_CONFIG.parallelism
    );
  } catch {
    return true;
  }
}
