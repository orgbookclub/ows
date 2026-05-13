import { generateKeyPairSync } from "crypto";

import { ConfigService } from "@nestjs/config";

import { JwtKeysService } from "./jwt-keys.service";

function configWith(values: Record<string, string | undefined>): ConfigService {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function freshKeypair(): { privateKey: string; publicKey: string } {
  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
}

describe("JwtKeysService", () => {
  it("loads the configured PEMs and exposes them with a JWKS document", () => {
    const { privateKey, publicKey } = freshKeypair();
    const keys = new JwtKeysService(
      configWith({ PRIVATE_KEY_PEM: privateKey, PUBLIC_KEY_PEM: publicKey }),
    );

    expect(keys.getPrivateKeyPem()).toContain("BEGIN PRIVATE KEY");
    expect(keys.getPublicKeyPem()).toContain("BEGIN PUBLIC KEY");
    expect(keys.getKid()).toMatch(/^[A-Za-z0-9_-]+$/);

    const jwks = keys.getJwks();
    expect(jwks.keys).toHaveLength(1);
    const [jwk] = jwks.keys;
    expect(jwk.kty).toBe("RSA");
    expect(jwk.use).toBe("sig");
    expect(jwk.alg).toBe("RS256");
    expect(jwk.kid).toBe(keys.getKid());
    expect(typeof jwk.n).toBe("string");
    expect(typeof jwk.e).toBe("string");
  });

  it("derives the public key from the private key when PUBLIC_KEY_PEM is omitted", () => {
    const { privateKey, publicKey } = freshKeypair();
    const keys = new JwtKeysService(
      configWith({ PRIVATE_KEY_PEM: privateKey }),
    );
    const ref = new JwtKeysService(
      configWith({ PRIVATE_KEY_PEM: privateKey, PUBLIC_KEY_PEM: publicKey }),
    );
    expect(keys.getKid()).toBe(ref.getKid());
    expect(keys.getJwks()).toEqual(ref.getJwks());
  });

  it("accepts PEMs with escaped \\n newlines (single-line .env form)", () => {
    const { privateKey, publicKey } = freshKeypair();
    const escape = (pem: string) => pem.replace(/\n/g, "\\n");
    const keys = new JwtKeysService(
      configWith({
        PRIVATE_KEY_PEM: escape(privateKey),
        PUBLIC_KEY_PEM: escape(publicKey),
      }),
    );
    expect(keys.getPrivateKeyPem()).toContain("\n");
    expect(keys.getJwks().keys[0].kty).toBe("RSA");
  });

  it("throws when PRIVATE_KEY_PEM is missing", () => {
    expect(() => new JwtKeysService(configWith({}))).toThrow(
      /Missing required env var PRIVATE_KEY_PEM/,
    );
  });

  it("produces stable kids for the same key (RFC 7638 thumbprint)", () => {
    const { privateKey, publicKey } = freshKeypair();
    const a = new JwtKeysService(
      configWith({ PRIVATE_KEY_PEM: privateKey, PUBLIC_KEY_PEM: publicKey }),
    );
    const b = new JwtKeysService(
      configWith({ PRIVATE_KEY_PEM: privateKey, PUBLIC_KEY_PEM: publicKey }),
    );
    expect(a.getKid()).toBe(b.getKid());
  });
});
