import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 * Strategy for restricting access to endpoints without valid Jwt tokens.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes an instance of JwtStrategy.
   *
   * @param {ConfigService} configService The global config service.
   */
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("PRIVATE_KEY"),
    });
  }

  /**
   * Placeholder for returning the clientId after validation.
   * The way passport works is we are ensured that this method is called only
   * with a valid clientId.
   *
   * @param {any} payload The payload.
   * @returns {Promise<any>} Trivial response containing client ID.
   */
  async validate(payload: any): Promise<any> {
    return { clientId: payload.sub };
  }
}
