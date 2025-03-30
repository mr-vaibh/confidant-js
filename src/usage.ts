import { loadEnv } from "./index";

(async () => {
  try {
    const envs = await loadEnv("confidant-cred.json");
    console.log("Decrypted Environment Variables:", envs);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
  }
})();
