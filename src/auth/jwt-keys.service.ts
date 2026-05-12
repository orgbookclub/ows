import { createHash, createPublicKey, KeyObject } from "crypto";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Reads and normalizes a required PEM env var.
 *
 * @param config The config service.
 * @param key The env var name.
 * @returns The normalized PEM string.
 */
function readPem(config: ConfigService, key: string): string {
  const raw = config.get<string>(key);
  if (!raw) {
    throw new Error(`Missing required env var ${key}`);
  }
  return normalizePem(raw);
}

/**
 * Replaces escaped `\n` sequences with real newlines so PEMs can be stored
 * on a single line in `.env` files.
 *
 * @param raw The raw env value.
 * @returns The normalized PEM.
 */
function normalizePem(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

/**
 * Computes the RFC 7638 SHA-256 JWK thumbprint of an RSA public JWK.
 * Used as the deterministic `kid` so verifiers can fetch the right key.
 *
 * @param jwk The JWK object containing kty, e, and n.
 * @returns The base64url-encoded SHA-256 thumbprint.
 */
function jwkThumbprint(jwk: Record<string, string>): string {
  const canonical = JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n });
  return createHash("sha256").update(canonical).digest("base64url");
}

/**
 * Public-facing JWK representation of the OWS signing key.
 * Mirrors the subset of RFC 7517 fields a verifier needs for RS256.
 */
export interface JwksKey {
  kty: string;
  use: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
}

/**
 * Standard JWKS document shape (RFC 7517 §5).
 */
export interface JwksDocument {
  keys: JwksKey[];
}

/**
 * Loads and exposes the RS256 keypair used to sign and verify OWS access
 * tokens. The private key is read from `PRIVATE_KEY_PEM`, the public key
 * from `PUBLIC_KEY_PEM` (or derived from the private key when omitted).
 * The `kid` is a deterministic JWK thumbprint per RFC 7638.
 */
@Injectable()
export class JwtKeysService {
  private readonly privateKeyPem: string;
  private readonly publicKeyPem: string;
  private readonly publicJwk: JwksKey;
  private readonly kid: string;

  /**
   * Initializes the key service by loading and validating the configured
   * PEMs.
   *
   * @param configService The global config service.
   */
  constructor(configService: ConfigService) {
    this.privateKeyPem = readPem(configService, "PRIVATE_KEY_PEM");
    const publicPemRaw = configService.get<string>("PUBLIC_KEY_PEM");
    let publicKeyObject: KeyObject;
    if (publicPemRaw) {
      this.publicKeyPem = normalizePem(publicPemRaw);
      publicKeyObject = createPublicKey({
        key: this.publicKeyPem,
        format: "pem",
      });
    } else {
      publicKeyObject = createPublicKey({
        key: this.privateKeyPem,
        format: "pem",
      });
      this.publicKeyPem = publicKeyObject
        .export({ type: "spki", format: "pem" })
        .toString();
    }
    const jwk = publicKeyObject.export({ format: "jwk" }) as Record<
      string,
      string
    >;
    if (jwk.kty !== "RSA" || !jwk.n || !jwk.e) {
      throw new Error("PUBLIC_KEY_PEM must be an RSA key");
    }
    this.kid = jwkThumbprint(jwk);
    this.publicJwk = {
      kty: "RSA",
      use: "sig",
      alg: "RS256",
      kid: this.kid,
      n: jwk.n,
      e: jwk.e,
    };
    Logger.debug(`Initialized JwtKeysService (kid=${this.kid})`);
  }

  /**
   * Returns the PEM-encoded RSA private key used for signing.
   *
   * @returns The signing key PEM.
   */
  getPrivateKeyPem(): string {
    return this.privateKeyPem;
  }

  /**
   * Returns the PEM-encoded RSA public key used for verification.
   *
   * @returns The verification key PEM.
   */
  getPublicKeyPem(): string {
    return this.publicKeyPem;
  }

  /**
   * Returns the deterministic key id matching the public JWK.
   *
   * @returns The kid string.
   */
  getKid(): string {
    return this.kid;
  }

  /**
   * Returns the JWKS document advertised at /auth/.well-known/jwks.json.
   *
   * @returns The JWKS document.
   */
  getJwks(): JwksDocument {
    return { keys: [this.publicJwk] };
  }
}
