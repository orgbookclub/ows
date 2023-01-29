import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

/**
 * The Auth service.
 */
@Injectable()
export class AuthService {
  /**
   * Initializes an instance of AuthService.
   *
   * @param configService The config service.
   * @param jwtService The JWT Service.
   */
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    Logger.debug("Initialized AuthService");
  }

  /**
   * Checks whether the given clientID & clientSecret are valid.
   *
   * @param clientId The client ID.
   * @param clientSecret The client secret.
   * @returns Valid clientID or null.
   */
  public async validateClient(clientId: string, clientSecret: string) {
    try {
      if (
        clientId === this.configService.get<string>("GREGG_CLIENT_ID") &&
        clientSecret === this.configService.get<string>("GREGG_CLIENT_SECRET")
      ) {
        return clientId;
      }
      return null;
    } catch (err) {
      Logger.error(`Error getting access token: ${err}`);
    }
  }

  /**
   * Creates and returns an access token.
   *
   * @param clientId The client ID.
   * @returns An access token JSON object.
   */
  public async getAccessToken(clientId: string) {
    const payload = { sub: clientId };
    return {
      // eslint-disable-next-line camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
