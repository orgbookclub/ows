import { Controller, Request, Post, UseGuards, Logger } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { ClientPasswordAuthGuard } from "./client-password-auth.guard";
import { AccessTokenDto } from "./dto/access-token.dto";
import { ClientCredentialsDto } from "./dto/client-credentials.dto";
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
   * @param request The request object.
   * @returns Json object containing the token.
   */
  @SkipAuth()
  @UseGuards(ClientPasswordAuthGuard)
  @Post("token")
  @ApiBody({
    type: ClientCredentialsDto,
  })
  @ApiOkResponse({ type: AccessTokenDto })
  async getAccessToken(@Request() request) {
    return await this.authService.getAccessToken(request.user);
  }
}
