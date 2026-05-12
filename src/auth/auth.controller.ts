import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Logger,
} from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthenticatedClient, AuthService } from "./auth.service";
import { ClientPasswordAuthGuard } from "./client-password-auth.guard";
import { AccessTokenDto } from "./dto/access-token.dto";
import { ClientCredentialsDto } from "./dto/client-credentials.dto";
import { JwksDto } from "./dto/jwks.dto";
import { SkipAuth } from "./jwt-auth.guard";
import { JwtKeysService } from "./jwt-keys.service";

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
   * @param jwtKeysService The JWT keys service used to publish the JWKS.
   */
  constructor(
    private authService: AuthService,
    private jwtKeysService: JwtKeysService,
  ) {
    Logger.debug("Initialized AuthController");
  }

  /**
   * Gets an access token, using the client credentials flow. Accepts
   * credentials either in the request body (per OAuth2 §4.4.2) or via the
   * Authorization: Basic header (per §2.3.1).
   *
   * @param request The request object.
   * @returns The RFC 6749 §5.1 access token response.
   */
  @SkipAuth()
  @UseGuards(ClientPasswordAuthGuard)
  @Post("token")
  @ApiBody({
    type: ClientCredentialsDto,
  })
  @ApiOkResponse({ type: AccessTokenDto })
  async getAccessToken(@Request() request) {
    return await this.authService.getAccessToken(
      request.user as AuthenticatedClient,
    );
  }

  /**
   * Returns the public JWKS document used by other services to verify
   * tokens issued by OWS, per RFC 7517.
   *
   * @returns The JWKS document.
   */
  @SkipAuth()
  @Get(".well-known/jwks.json")
  @ApiOkResponse({ type: JwksDto })
  getJwks(): JwksDto {
    return this.jwtKeysService.getJwks();
  }
}
