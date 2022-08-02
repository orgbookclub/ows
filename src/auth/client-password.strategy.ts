import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2-client-password";

import { AuthService } from "./auth.service";

/**
 *
 */
@Injectable()
export class ClientPasswordStrategy extends PassportStrategy(Strategy) {
  /**
   *
   * @param {AuthService} authService The auth service.
   */
  constructor(private authService: AuthService) {
    super();
  }

  /**
   *
   *
   * @param {string} clientId The client ID.
   * @param {string} clientSecret The client secret.
   */
  async validate(clientId: string, clientSecret: string) {
    const client = this.authService.validateClient(clientId, clientSecret);
    if (!client) {
      throw new UnauthorizedException();
    }
    return client;
  }
}
