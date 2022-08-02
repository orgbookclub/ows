import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 *
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
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
   *
   * @param {any} payload The payload.
   * @returns {Promise<any>} Trivial response containing client ID.
   */
  async validate(payload: any): Promise<any> {
    return { clientId: payload.sub };
  }
}
