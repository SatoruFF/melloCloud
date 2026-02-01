import { webcrypto } from "crypto";
import { MESSAGE_ENCRYPTION_KEY } from "../configs/config.js";

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const KEY_LENGTH = 256;

// Cache for the encryption key
let cachedKey: webcrypto.CryptoKey | null = null;

/**
 * Derives a CryptoKey from the environment variable
 */
const getEncryptionKey = async (): Promise<webcrypto.CryptoKey> => {
  if (cachedKey) {
    return cachedKey;
  }

  const keyString = MESSAGE_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error("MESSAGE_ENCRYPTION_KEY is not set in environment variables");
  }

  // Convert string to bytes
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(keyString);

  // Import as raw key material
  const importedKey = await webcrypto.subtle.importKey("raw", keyMaterial, { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ]);

  // Derive actual encryption key using PBKDF2
  const salt = encoder.encode("message-encryption-salt");
  cachedKey = await webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    importedKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );

  return cachedKey;
};

/**
 * Serializes and encrypts a message object
 * @param message - The message object to serialize
 * @returns Encrypted string (base64 encoded)
 */
export const serializeMessage = async <T extends object>(message: T): Promise<string> => {
  try {
    // Serialize the message object to JSON
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(message);
    const data = encoder.encode(jsonString);

    // Generate a random initialization vector
    const iv = webcrypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Get the encryption key
    const key = await getEncryptionKey();

    // Encrypt the message
    const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      data
    );

    // Combine iv + encrypted data (GCM includes auth tag automatically)
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64
    return Buffer.from(combined).toString("base64");
  } catch (error) {
    throw new Error(`Failed to serialize message: ${(error as Error).message}`);
  }
};

/**
 * Decrypts and deserializes an encrypted message string
 * @param encryptedMessage - The encrypted base64 string
 * @returns Decrypted message object
 */
export const deserializeMessage = async <T extends object>(encryptedMessage: string): Promise<T> => {
  try {
    // Decode from base64
    const combined = Buffer.from(encryptedMessage, "base64");

    // Extract iv and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const encryptedData = combined.subarray(IV_LENGTH);

    // Get the encryption key
    const key = await getEncryptionKey();

    // Decrypt the message
    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      encryptedData
    );

    // Convert to string and parse JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedData);

    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(`Failed to deserialize message: ${(error as Error).message}`);
  }
};

// Sync versions if you really need them (but they're slower on first call)
export const serializeMessageSync = <T extends object>(message: T): string => {
  throw new Error("Use async version: serializeMessage() - crypto operations should be async");
};

export const deserializeMessageSync = <T extends object>(encryptedMessage: string): T => {
  throw new Error("Use async version: deserializeMessage() - crypto operations should be async");
};
