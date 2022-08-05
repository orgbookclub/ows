import {
  CustomDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

export const SKIP_AUTH = "skipAuth";
/**
 * A custom decorator for skipping JWT authentication flow.
 *
 * @returns {CustomDecorator<string>} A custom decorator.
 */
export const SkipAuth = (): CustomDecorator<string> =>
  SetMetadata(SKIP_AUTH, true);
/**
 *
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  /**
   *
   * @param {ConfigService} configService The global config service.
   * @param {Reflector} reflector A reflector. See documentation for more details.
   */
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    super();
  }

  /**
   *
   * @param {ExecutionContext} context The execution context.
   * @returns {any} A boolean indicating whether method can skip auth or not.
   */
  canActivate(context: ExecutionContext): any {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth || this.configService.get<string>("ENV") === "dev") {
      return true;
    }
    return super.canActivate(context);
  }
}
