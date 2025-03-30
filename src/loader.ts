import axios from "axios";
import crypto from "crypto";
import { decryptData } from "./decryption";

/**
 * Loads encrypted environment variables from API and decrypts them.
 *
 * @param credFilePath - The absolute or relative path to `confidant-cred.json`.
 * @returns Decrypted environment variables as a key-value object.
 */
export async function loadEnv(credFilePath: string): Promise<Record<string, string>> {
  const apiUrl = process.env.NEXT_PUBLIC_CONFIDANT_API_URL || "http://localhost:8000/api/get-sdk-keys/";

  try {
    // Ensure this runs only on the server
    if (typeof window !== "undefined") {
      throw new Error("Confidant: `loadEnv` should only be called on the server.");
    }

    // Dynamically import `fs` and `path` (avoids bundling issues in Next.js)
    const fs = await import("fs");
    const path = await import("path");

    // Resolve credentials file path (relative to the Next.js app)
    const credPath = path.resolve(credFilePath);
    if (!fs.existsSync(credPath)) {
      throw new Error(`Confidant: Credentials file not found: ${credPath}`);
    }

    const credData = JSON.parse(fs.readFileSync(credPath, "utf-8"));
    if (!credData.private_key || !credData.username || !credData.public_key) {
      throw new Error("Confidant: Private key, public key, or username missing in credentials file.");
    }

    // Generate SHA-256 hash of the public key
    const publicKeyHash = crypto.createHash("sha256").update(credData.public_key, "utf8").digest("hex");

    // Fetch encrypted data from API
    const response = await axios.post<{
      encrypted_data: string;
      encrypted_aes_key: string;
      iv: string;
    }>(
      apiUrl,
      { username: credData.username }, // JSON body
      {
        headers: {
          "Content-Type": "application/json",
          "X-Username": credData.username,
          "X-Public-Key-Hash": publicKeyHash, // ✅ New header with SHA-256 hash of the public key
        },
      }
    );

    if (!response.data) {
      throw new Error("Confidant: Empty response from API.");
    }

    // Extract encrypted values
    const { encrypted_data, encrypted_aes_key, iv } = response.data;
    if (!encrypted_data || !encrypted_aes_key || !iv) {
      throw new Error("Confidant: API response missing required encrypted fields.");
    }

    // Decrypt and return environment variables
    return decryptData(encrypted_data, encrypted_aes_key, iv, credData.private_key);
  } catch (error) {
    throw new Error(`Confidant: Failed to fetch and decrypt - ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
