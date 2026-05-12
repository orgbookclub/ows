import { ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

const SKIP_AUTH = "skipAuth";

/**
 * A custom decorator for skipping JWT authentication flow.
 *
 * @returns A custom decorator.
 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);

/**
 * Guard for restricting access to endpoints without a valid access token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  /**
   * Initializes an instance of JwtAuthGuard.
   *
   * @param reflector A reflector. See documentation for more details.
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Skips authentication for handlers explicitly marked with @SkipAuth(),
   * otherwise delegates to the underlying passport-jwt strategy.
   *
   * @param context The execution context.
   * @returns A boolean indicating whether the request is authorized.
   */
  canActivate(context: ExecutionContext) {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) {
      return true;
    }
    return super.canActivate(context);
  }
}
