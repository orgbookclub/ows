import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { SCOPES_METADATA } from "./scopes.decorator";

/**
 * Guard that enforces the scopes declared via the @Scopes() decorator
 * against the bearer token's scope claim. Run after JwtAuthGuard so that
 * `request.user.scopes` is populated. The wildcard scope `*` matches any
 * required scope.
 */
@Injectable()
export class ScopesGuard implements CanActivate {
  /**
   * Initializes the scopes guard.
   *
   * @param reflector The metadata reflector.
   */
  constructor(private readonly reflector: Reflector) {
    Logger.debug("Initialized ScopesGuard");
  }

  /**
   * Compares the scopes required by the route against the scopes carried
   * by the bearer token.
   *
   * @param context The execution context.
   * @returns True if the request is authorized, otherwise throws.
   */
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      SCOPES_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request?.user as { scopes?: string[] } | undefined;
    if (!user || !Array.isArray(user.scopes)) {
      throw new UnauthorizedException();
    }
    const granted = user.scopes;
    if (granted.includes("*")) {
      return true;
    }
    const missing = required.filter((scope) => !granted.includes(scope));
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing required scope(s): ${missing.join(", ")}`,
      );
    }
    return true;
  }
}
