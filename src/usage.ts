import { loadEnv } from "./index";

(async () => {
  try {
    const envs = await loadEnv("http://localhost:8000/api/get-sdk-keys/");
    console.log("Decrypted Environment Variables:", envs);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
  }
})();
