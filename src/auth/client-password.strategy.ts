import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2-client-password";

import { AuthenticatedClient, AuthService } from "./auth.service";

/**
 * Strategy for validating the Client Credentials auth flow.
 */
@Injectable()
export class ClientPasswordStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes an instance of ClientPasswordStrategy.
   *
   * @param authService The auth service.
   */
  constructor(private authService: AuthService) {
    super();
    Logger.debug("Initialized ClientPasswordStrategy");
  }

  /**
   * Calls auth service to validate the client ID and secret. Returns the
   * authenticated client (with scopes) for downstream handlers, or rejects
   * with 401 on invalid credentials.
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
