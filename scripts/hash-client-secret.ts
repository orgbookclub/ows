/* eslint-disable no-console */
import * as argon2 from "argon2";

/**
 * Hashes a plaintext client secret with argon2id and prints the resulting
 * hash. Use this when adding a new entry to `config/clients.json`. Pass
 * the plaintext as the first CLI argument; if omitted, a random
 * 32-character secret is generated, printed, and hashed.
 *
 * Run with `yarn ts-node scripts/hash-client-secret.ts [plaintext]`.
 */
async function main(): Promise<void> {
  let plaintext = process.argv[2];
  if (!plaintext) {
    const { randomBytes } = await import("crypto");
    plaintext = randomBytes(24).toString("base64url");
    console.log("# Generated plaintext secret (store this in a vault):");
    console.log(plaintext);
    console.log("");
  }
  const hash = await argon2.hash(plaintext, { type: argon2.argon2id });
  console.log("# Drop this into config/clients.json as the secretHash:");
  console.log(hash);
}

void main();
