import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy as Strategy } from "passport-http";

import { AuthenticatedClient, AuthService } from "./auth.service";

/**
 * Strategy for validating client credentials sent via HTTP Basic auth on
 * the /auth/token endpoint, per RFC 6749 §2.3.1. Complements the
 * passport-oauth2-client-password strategy which only inspects the body.
 */
@Injectable()
export class ClientBasicStrategy extends PassportStrategy(Strategy, "basic") {
  /**
   * Initializes an instance of ClientBasicStrategy. Falls back to passport
   * defaults; when no Authorization header is present the underlying
   * BasicStrategy short-circuits with `done(null, false)`, which lets the
   * `AuthGuard(["basic", "oauth2-client-password"])` chain hand the
   * request to the body-form strategy as the next attempt.
   *
   * @param authService The auth service.
   */
  constructor(private authService: AuthService) {
    super();
    Logger.debug("Initialized ClientBasicStrategy");
  }

  /**
   * Validates the credentials carried by the Authorization: Basic header.
   *
   * @param clientId The client ID.
   * @param clientSecret The client secret.
   * @returns The authenticated client.
   */
  async validate(
    clientId: string,
    clientSecret: string,
  ): Promise<AuthenticatedClient> {
    const client = await this.authService.validateClient(
      clientId,
      clientSecret,
    );
    if (!client) {
      throw new UnauthorizedException();
    }
    return client;
  }
}
