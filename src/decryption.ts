import crypto from "crypto";

/**
 * Decrypts AES-encrypted environment variables using the provided private key.
 * 
 * @param encryptedEnvB64 - Base64 encoded encrypted environment variables.
 * @param encryptedAESKeyB64 - Base64 encoded encrypted AES key.
 * @param ivB64 - Base64 encoded IV.
 * @param privateKeyPem - Base64 encoded private key in PEM format.
 * @returns Decrypted environment variables as a key-value object.
 */
export function decryptData(
  encryptedEnvB64: string,
  encryptedAESKeyB64: string,
  ivB64: string,
  privateKeyPem: string
): Record<string, string> {
  try {
    // Convert base64 private key to Buffer and create key object
    const privateKey = crypto.createPrivateKey({
      key: Buffer.from(privateKeyPem, "base64"),
      format: "pem",
      type: "pkcs8",
    });

    // Decrypt AES key using RSA private key
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedAESKeyB64, "base64")
    );

    // Decrypt environment variables using AES-256-CBC
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      aesKey,
      Buffer.from(ivB64, "base64")
    );
    let decrypted = decipher.update(Buffer.from(encryptedEnvB64, "base64"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    } else {
      throw new Error("Decryption failed due to an unknown error.");
    }
  }
}
