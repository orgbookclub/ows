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
   * @param configService The global config service.
   * @param reflector A reflector. See documentation for more details.
   */
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    super();
  }

  /**
   * Handles additional logic for checking if the Guard should pass/fail.
   * Hardcoded to skip auth for dev environment.
   *
   * @param context The execution context.
   * @returns A boolean indicating whether method can skip auth or not.
   */
  canActivate(context: ExecutionContext) {
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
