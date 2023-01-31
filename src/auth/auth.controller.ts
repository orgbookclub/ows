import { Controller, Request, Post, UseGuards, Logger } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { ClientPasswordAuthGuard } from "./client-password-auth.guard";
import { SkipAuth } from "./jwt-auth.guard";

/**
 * The Auth controller.
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  /**
   * Initializes an instance of AuthController.
   *
   * @param authService The auth service.
   */
  constructor(private authService: AuthService) {
    Logger.debug("Initialized AuthController");
  }
  /**
   * Gets an access token, using the client credentials flow.
   *
   * @param req The request object.
   * @returns Json object containing the token.
   */
  @SkipAuth()
  @UseGuards(ClientPasswordAuthGuard)
  @Post("token")
  async getAccessToken(@Request() req) {
    return await this.authService.getAccessToken(req.user);
  }
}
