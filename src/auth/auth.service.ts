import { randomUUID } from "crypto";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";

import { ClientRegistryService } from "./client-registry.service";

/**
 * The authenticated client identity returned by validateClient and
 * consumed by getAccessToken.
 */
export interface AuthenticatedClient {
  clientId: string;
  scopes: string[];
}

/**
 * RFC 6749 §5.1 access token response.
 */
export interface AccessTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

/**
 * The Auth service.
 */
@Injectable()
export class AuthService {
  private readonly dummyHashPromise: Promise<string>;

  /**
   * Initializes an instance of AuthService.
   *
   * @param jwtService The JWT Service.
   * @param clientRegistry The registered-clients catalogue.
   * @param accessTokenTtlSeconds The configured token lifetime in seconds.
   */
  constructor(
    private jwtService: JwtService,
    private clientRegistry: ClientRegistryService,
    @Inject("ACCESS_TOKEN_TTL_SECONDS")
    private accessTokenTtlSeconds: number,
  ) {
    this.dummyHashPromise = argon2.hash("constant-time-padding-v1", {
      type: argon2.argon2id,
    });
    this.dummyHashPromise.catch((err) => {
      Logger.error(`Failed to precompute dummy argon2 hash: ${err}`);
    });
    Logger.debug("Initialized AuthService");
  }

  /**
   * Verifies the supplied client credentials against the registry. Both
   * the unknown-clientId and wrong-secret branches perform an
   * argon2.verify call (against a precomputed dummy hash for the
   * unknown-clientId branch), so the response time does not leak whether
   * the clientId itself was registered.
   *
   * @param clientId The client ID.
   * @param clientSecret The client secret.
   * @returns The authenticated client, or undefined if the credentials are invalid.
   */
  public async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<AuthenticatedClient | undefined> {
    const client = this.clientRegistry.findById(clientId);
    if (!client) {
      try {
        await argon2.verify(await this.dummyHashPromise, clientSecret);
      } catch {
        // Intentionally ignored: the dummy verify exists only to
        // equalize timing with the wrong-secret branch.
      }
      return undefined;
    }
    let ok = false;
    try {
      ok = await argon2.verify(client.secretHash, clientSecret);
    } catch (err) {
      Logger.error(`Failed to verify client secret: ${err}`);
      return undefined;
    }
    if (!ok) {
      return undefined;
    }
    return { clientId: client.clientId, scopes: [...client.scopes] };
  }

  /**
   * Issues an RFC 6749 §5.1 access-token response for the given
   * authenticated client. Encodes the client's granted scopes into the
   * `scope` claim (space-separated).
   *
   * @param client The authenticated client.
   * @returns The access token response.
   */
  public async getAccessToken(
    client: AuthenticatedClient,
  ): Promise<AccessTokenResponse> {
    const scope = client.scopes.join(" ");
    const payload = { sub: client.clientId, scope };
    const accessToken = this.jwtService.sign(payload, {
      jwtid: randomUUID(),
    });
    /* eslint-disable camelcase */
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: this.accessTokenTtlSeconds,
      scope,
    };
    /* eslint-enable camelcase */
  }
}
