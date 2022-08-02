import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 *
 */
@Injectable()
export class AuthService {
  /**
   *
   * @param {JwtService} jwtService The JWT Service.
   */
  constructor(private jwtService: JwtService) {
    Logger.debug("Initialized AuthService");
  }

  /**
   *
   * @param {string} clientId The client ID.
   * @param {string} clientSecret The client secret.
   */
  public async validateClient(clientId: string, clientSecret: string) {
    try {
      if (
        clientId === "greggClientId" &&
        clientSecret === "greggClientSecret"
      ) {
        return clientId;
      }
      return null;
    } catch (err) {
      Logger.error(`Error getting access token: ${err}`);
    }
  }

  /**
   *
   * @param {string} clientId The client ID.
   */
  public async getAccessToken(clientId: string) {
    const payload = { sub: clientId };
    return {
      // eslint-disable-next-line camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
