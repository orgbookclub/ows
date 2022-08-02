import { Controller, Request, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

import { ClientPasswordAuthGuard } from "./client-password-auth.guard";
import { SkipAuth } from "./jwt-auth.guard";

/**
 *
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}
  /**
   *
   * @param req
   */
  @SkipAuth()
  @UseGuards(ClientPasswordAuthGuard)
  @Post("token")
  async token(@Request() req) {
    return await this.authService.getAccessToken(req.user);
  }
}
