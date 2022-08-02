import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 *
 */
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

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

  public async getAccessToken(client: string) {
    const payload = { sub: client };
    return {
      // eslint-disable-next-line camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
