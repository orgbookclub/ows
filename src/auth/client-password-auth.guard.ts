import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard which protects the /auth/token endpoint.
 */
@Injectable()
export class ClientPasswordAuthGuard extends AuthGuard(
  "oauth2-client-password",
) {}
