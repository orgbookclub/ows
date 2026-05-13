import { generateKeyPairSync } from "crypto";

import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as argon2 from "argon2";

import { AuthService } from "./auth.service";
import { ClientRegistryService } from "./client-registry.service";
import { JwtKeysService } from "./jwt-keys.service";

const TTL_SECONDS = 3600;
const TOKEN_ISSUER = "ows";
const TOKEN_AUDIENCE = "ows-api";

function buildKeyConfig(): ConfigService {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return {
    get: jest.fn((key: string) => {
      if (key === "PRIVATE_KEY_PEM") return privateKey;
      if (key === "PUBLIC_KEY_PEM") return publicKey;
      return undefined;
    }),
  } as unknown as ConfigService;
}

describe("AuthService", () => {
  let module: TestingModule;
  let service: AuthService;
  let jwtService: JwtService;
  let keys: JwtKeysService;
  const greggSecret = "gregg-secret-plaintext";
  const mcpSecret = "mcp-secret-plaintext";
  let registryStub: ClientRegistryService;

  beforeAll(async () => {
    const greggHash = await argon2.hash(greggSecret, { type: argon2.argon2id });
    const mcpHash = await argon2.hash(mcpSecret, { type: argon2.argon2id });
    registryStub = {
      findById: jest.fn((clientId: string) => {
        if (clientId === "gregg") {
          return {
            clientId: "gregg",
            secretHash: greggHash,
            scopes: ["events:read", "events:write", "users:read"],
          };
        }
        if (clientId === "mcp") {
          return {
            clientId: "mcp",
            secretHash: mcpHash,
            scopes: ["events:read", "users:read"],
          };
        }
        return undefined;
      }),
      size: jest.fn(() => 2),
    } as unknown as ClientRegistryService;

    const config = buildKeyConfig();
    keys = new JwtKeysService(config);
    jwtService = new JwtService({
      privateKey: keys.getPrivateKeyPem(),
      publicKey: keys.getPublicKeyPem(),
      signOptions: {
        algorithm: "RS256",
        expiresIn: TTL_SECONDS,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
        keyid: keys.getKid(),
      },
      verifyOptions: {
        algorithms: ["RS256"],
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: ClientRegistryService, useValue: registryStub },
        { provide: "ACCESS_TOKEN_TTL_SECONDS", useValue: TTL_SECONDS },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("validateClient", () => {
    it("returns the authenticated client on matching credentials", async () => {
      const result = await service.validateClient("gregg", greggSecret);
      expect(result).toEqual({
        clientId: "gregg",
        scopes: ["events:read", "events:write", "users:read"],
      });
    });

    it("returns undefined for an unknown clientId", async () => {
      const result = await service.validateClient("ghost", "anything");
      expect(result).toBeUndefined();
    });

    it("returns undefined for a wrong secret", async () => {
      const result = await service.validateClient("gregg", "wrong-secret");
      expect(result).toBeUndefined();
    });

    it("returns a fresh scopes array, not the registry reference", async () => {
      const result = await service.validateClient("gregg", greggSecret);
      const original = registryStub.findById("gregg")?.scopes;
      expect(result?.scopes).not.toBe(original);
    });
  });

  describe("getAccessToken", () => {
    it("issues an RFC 6749 §5.1 token response with kid, iss, aud, exp, jti, scope", async () => {
      const response = await service.getAccessToken({
        clientId: "mcp",
        scopes: ["events:read", "users:read"],
      });

      expect(response.token_type).toBe("Bearer");
      expect(response.expires_in).toBe(TTL_SECONDS);
      expect(response.scope).toBe("events:read users:read");
      expect(typeof response.access_token).toBe("string");

      const verified = jwtService.verify<Record<string, unknown>>(
        response.access_token,
      );
      expect(verified.sub).toBe("mcp");
      expect(verified.iss).toBe(TOKEN_ISSUER);
      expect(verified.aud).toBe(TOKEN_AUDIENCE);
      expect(verified.scope).toBe("events:read users:read");
      expect(typeof verified.jti).toBe("string");
      expect(typeof verified.exp).toBe("number");
      expect(typeof verified.iat).toBe("number");
      expect((verified.exp as number) - (verified.iat as number)).toBe(
        TTL_SECONDS,
      );

      const decoded = jwtService.decode(response.access_token, {
        complete: true,
      }) as { header: { alg: string; kid: string } };
      expect(decoded.header.alg).toBe("RS256");
      expect(decoded.header.kid).toBe(keys.getKid());
    });

    it("issues different jti values across calls", async () => {
      const a = await service.getAccessToken({
        clientId: "gregg",
        scopes: ["events:read"],
      });
      const b = await service.getAccessToken({
        clientId: "gregg",
        scopes: ["events:read"],
      });
      const ja = jwtService.decode(a.access_token) as { jti: string };
      const jb = jwtService.decode(b.access_token) as { jti: string };
      expect(ja.jti).not.toBe(jb.jti);
    });
  });
});
