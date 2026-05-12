/* eslint-disable no-console */
import { generateKeyPairSync } from "crypto";

/**
 * Generates a fresh RSA-2048 keypair and prints PEM-encoded values ready
 * to drop into a `.env` file as `PRIVATE_KEY_PEM` and `PUBLIC_KEY_PEM`.
 * Run with `yarn ts-node scripts/generate-jwt-keypair.ts`.
 */
function main(): void {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const escape = (pem: string): string => pem.replace(/\n/g, "\\n");
  console.log("# Add the following to your .env (single-line PEM form):");
  console.log("");
  console.log(`PRIVATE_KEY_PEM="${escape(privateKey)}"`);
  console.log(`PUBLIC_KEY_PEM="${escape(publicKey)}"`);
}

main();
