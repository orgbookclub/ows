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
   *
   * @param {AuthService} authService The auth service.
   */
  constructor(private authService: AuthService) {
    Logger.debug("Initialized AuthController");
  }
  /**
   *
   * @param {any} req The request object.
   */
  @SkipAuth()
  @UseGuards(ClientPasswordAuthGuard)
  @Post("token")
  async token(@Request() req: any) {
    return await this.authService.getAccessToken(req.user);
  }
}
