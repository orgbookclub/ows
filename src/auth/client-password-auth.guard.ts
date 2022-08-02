import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 *
 */
@Injectable()
export class ClientPasswordAuthGuard extends AuthGuard(
  "oauth2-client-password",
) {}
