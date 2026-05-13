import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtKeysService } from "./jwt-keys.service";

/**
 * Strategy for restricting access to endpoints without valid Jwt tokens.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes an instance of JwtStrategy. Verifies tokens with the RS256
   * public key from JwtKeysService and enforces issuer/audience claims.
   *
   * @param keys The JWT keys service.
   */
  constructor(keys: JwtKeysService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: keys.getPublicKeyPem(),
      algorithms: ["RS256"],
      issuer: "ows",
      audience: "ows-api",
    });
    Logger.debug("Initialized JwtStrategy");
  }

  /**
   * Returns the authenticated client identity (clientId + scopes) for the
   * verified payload. Passport guarantees this method is only invoked once
   * the signature, expiry, issuer, and audience have all been validated.
   *
   * @param payload The verified JWT payload.
   * @param payload.sub The token subject (the client id).
   * @param payload.scope The space-separated granted scopes.
   * @returns The authenticated identity attached to req.user.
   */
  async validate(payload: { sub: string; scope?: string }) {
    const scopes =
      typeof payload.scope === "string" && payload.scope.length > 0
        ? payload.scope.split(" ")
        : [];
    return { clientId: payload.sub, scopes };
  }
}
