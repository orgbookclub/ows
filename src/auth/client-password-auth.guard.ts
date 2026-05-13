import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard which protects the /auth/token endpoint, accepting credentials
 * either via the Authorization: Basic header (RFC 6749 §2.3.1) or as
 * client_id/client_secret form params (§4.4.2). The first strategy that
 * succeeds wins.
 */
@Injectable()
export class ClientPasswordAuthGuard extends AuthGuard([
  "basic",
  "oauth2-client-password",
]) {}
