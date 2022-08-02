import { ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

export const SKIP_AUTH = "skipAuth";
/**
 *
 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
/**
 *
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  /**
   *
   * @param reflector
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   *
   * @param context
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
