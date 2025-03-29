import fs from "fs";
import path from "path";
import axios from "axios";
import { decryptData } from "./decryption";

/**
 * Loads encrypted environment variables from API and decrypts them.
 *
 * @param apiUrl - The API endpoint providing encrypted keys.
 * @returns Decrypted environment variables as a key-value object.
 */
export async function loadEnv(apiUrl: string): Promise<Record<string, string>> {
  try {
    // Read credentials from confidant-cred.json
    const credPath = path.join(process.cwd(), "confidant-cred.json");
    if (!fs.existsSync(credPath)) {
      throw new Error(`Credentials file not found: ${credPath}`);
    }

    const credData = JSON.parse(fs.readFileSync(credPath, "utf-8"));
    if (!credData.private_key || !credData.username) {
      throw new Error("Private key or username missing in confidant-cred.json");
    }

    // Fetch encrypted data from API
    const response = await axios.post(apiUrl, { username: credData.username });

    if (!response.data) {
      throw new Error("Empty response from API.");
    }

    // Extract encrypted values
    const { encrypted_data, encrypted_aes_key, iv } = response.data;

    if (!encrypted_data || !encrypted_aes_key || !iv) {
      throw new Error("API response missing required encrypted fields.");
    }

    // Decrypt and return environment variables
    return decryptData(encrypted_data, encrypted_aes_key, iv, credData.private_key);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch and decrypt: ${error.message}`);
    } else {
      throw new Error("Failed to fetch and decrypt due to an unknown error.");
    }
  }
}
