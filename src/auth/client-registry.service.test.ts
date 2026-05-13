import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { ConfigService } from "@nestjs/config";

import { ClientRegistryService } from "./client-registry.service";

function buildConfig(overrides: Record<string, string> = {}): ConfigService {
  return {
    get: jest.fn((key: string) => overrides[key]),
  } as unknown as ConfigService;
}

describe("ClientRegistryService", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "ows-clients-"));
    mkdirSync(join(tmpDir, "config"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeRegistry(contents: unknown): void {
    writeFileSync(
      join(tmpDir, "config", "clients.json"),
      JSON.stringify(contents),
      "utf-8",
    );
  }

  function writeRawRegistry(raw: string): void {
    writeFileSync(join(tmpDir, "config", "clients.json"), raw, "utf-8");
  }

  it("loads valid entries and exposes them by clientId", () => {
    writeRegistry([
      {
        clientId: "gregg",
        secretHash: "$argon2id$v=19$m=65536,t=3,p=4$AAAA$BBBB",
        scopes: ["events:read", "events:write"],
      },
      {
        clientId: "mcp",
        secretHash: "$argon2id$v=19$m=65536,t=3,p=4$CCCC$DDDD",
        scopes: ["events:read", "users:read"],
      },
    ]);

    const registry = new ClientRegistryService(buildConfig());

    expect(registry.size()).toBe(2);
    expect(registry.findById("gregg")?.scopes).toEqual([
      "events:read",
      "events:write",
    ]);
    expect(registry.findById("mcp")?.scopes).toEqual([
      "events:read",
      "users:read",
    ]);
    expect(registry.findById("unknown")).toBeUndefined();
  });

  it("honours the CLIENTS_FILE env override", () => {
    const altDir = mkdtempSync(join(tmpdir(), "ows-clients-alt-"));
    try {
      const altPath = join(altDir, "alt-clients.json");
      writeFileSync(
        altPath,
        JSON.stringify([
          {
            clientId: "from-override",
            secretHash: "$argon2id$v=19$m=65536,t=3,p=4$EEEE$FFFF",
            scopes: ["events:read"],
          },
        ]),
        "utf-8",
      );

      const registry = new ClientRegistryService(
        buildConfig({ CLIENTS_FILE: altPath }),
      );

      expect(registry.size()).toBe(1);
      expect(registry.findById("from-override")?.scopes).toEqual([
        "events:read",
      ]);
    } finally {
      rmSync(altDir, { recursive: true, force: true });
    }
  });

  it("throws when the file is missing", () => {
    expect(() => new ClientRegistryService(buildConfig())).toThrow(
      /Failed to read clients registry/,
    );
  });

  it("throws when the file is not valid JSON", () => {
    writeRawRegistry("{ not json");
    expect(() => new ClientRegistryService(buildConfig())).toThrow(
      /not valid JSON/,
    );
  });

  it("throws when the top level is not an array", () => {
    writeRegistry({ clientId: "x" });
    expect(() => new ClientRegistryService(buildConfig())).toThrow(
      /must be a JSON array/,
    );
  });

  it("rejects non-argon2 secret hashes", () => {
    writeRegistry([
      { clientId: "gregg", secretHash: "plaintext", scopes: ["x"] },
    ]);
    expect(() => new ClientRegistryService(buildConfig())).toThrow(
      /must be an argon2 hash/,
    );
  });

  it("rejects empty scopes arrays entries", () => {
    writeRegistry([
      {
        clientId: "gregg",
        secretHash: "$argon2id$v=19$m=65536,t=3,p=4$A$B",
        scopes: ["", "events:read"],
      },
    ]);
    expect(() => new ClientRegistryService(buildConfig())).toThrow(
      /scopes must be an array of non-empty strings/,
    );
  });

  it("rejects duplicate clientIds", () => {
    writeRegistry([
      {
        clientId: "gregg",
        secretHash: "$argon2id$v=19$m=65536,t=3,p=4$A$B",
        scopes: ["x"],
      },
      {
        clientId: "gregg",
        secretHash: "$argon2id$v=19$m=65536,t=3,p=4$C$D",
        scopes: ["y"],
      },
    ]);
    expect(() => new ClientRegistryService(buildConfig())).toThrow(
      /Duplicate clientId/,
    );
  });
});
