import { readFileSync } from "fs";
import { resolve } from "path";

import { Injectable, Logger } from "@nestjs/common";

const CLIENTS_FILE_PATH = "config/clients.json";

/**
 * Validates a single registry entry and returns it typed.
 *
 * @param entry The raw entry to validate.
 * @param filePath The source file path, used in error messages.
 * @returns A typed registered client.
 */
function validateEntry(entry: unknown, filePath: string): RegisteredClient {
  if (!entry || typeof entry !== "object") {
    throw new Error(`Invalid client entry in ${filePath}: not an object`);
  }
  const e = entry as Record<string, unknown>;
  if (typeof e.clientId !== "string" || e.clientId.length === 0) {
    throw new Error(
      `Invalid client entry in ${filePath}: clientId must be a non-empty string`,
    );
  }
  if (typeof e.secretHash !== "string" || !e.secretHash.startsWith("$argon2")) {
    throw new Error(
      `Invalid client entry "${e.clientId}" in ${filePath}: secretHash must be an argon2 hash`,
    );
  }
  if (
    !Array.isArray(e.scopes) ||
    e.scopes.some((s) => typeof s !== "string" || s.length === 0)
  ) {
    throw new Error(
      `Invalid client entry "${e.clientId}" in ${filePath}: scopes must be an array of non-empty strings`,
    );
  }
  return {
    clientId: e.clientId,
    secretHash: e.secretHash,
    scopes: e.scopes as string[],
  };
}

/**
 * Validates the parsed registry payload and builds the lookup map.
 *
 * @param parsed The JSON-parsed registry contents.
 * @param filePath The source file path, used in error messages.
 * @returns A map keyed by clientId.
 */
function buildClientMap(
  parsed: unknown,
  filePath: string,
): Map<string, RegisteredClient> {
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Clients registry at ${filePath} must be a JSON array of client entries`,
    );
  }
  const map = new Map<string, RegisteredClient>();
  for (const entry of parsed) {
    const client = validateEntry(entry, filePath);
    if (map.has(client.clientId)) {
      throw new Error(`Duplicate clientId "${client.clientId}" in ${filePath}`);
    }
    map.set(client.clientId, client);
  }
  return map;
}

/**
 * In-memory representation of a single registered API client.
 */
export interface RegisteredClient {
  clientId: string;
  secretHash: string;
  scopes: string[];
}

/**
 * Loads the registered-clients catalogue from `config/clients.json` into an
 * in-memory map at bootstrap. The file is checked into the repo and
 * contains argon2id-hashed secrets only — no plaintext credentials.
 */
@Injectable()
export class ClientRegistryService {
  private readonly clients: Map<string, RegisteredClient>;

  /**
   * Initializes the registry by reading and parsing the catalogue file
   * relative to the current working directory.
   */
  constructor() {
    const filePath = resolve(process.cwd(), CLIENTS_FILE_PATH);
    let raw: string;
    try {
      raw = readFileSync(filePath, "utf-8");
    } catch (err) {
      throw new Error(
        `Failed to read clients registry at ${filePath}: ${
          (err as Error).message
        }`,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `Clients registry at ${filePath} is not valid JSON: ${
          (err as Error).message
        }`,
      );
    }
    this.clients = buildClientMap(parsed, filePath);
    Logger.debug(
      `Initialized ClientRegistryService (${this.clients.size} client(s) loaded from ${filePath})`,
    );
  }

  /**
   * Returns the registered client with the given id, or undefined if no
   * such client exists.
   *
   * @param clientId The client id to look up.
   * @returns The registered client, if any.
   */
  findById(clientId: string): RegisteredClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Returns the number of registered clients. Useful in tests and health
   * diagnostics.
   *
   * @returns The client count.
   */
  size(): number {
    return this.clients.size;
  }
}
