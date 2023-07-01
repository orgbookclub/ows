import { Controller, Get, Logger } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SkipAuth } from "../auth/jwt-auth.guard";

/**
 * The Health Controller.
 */
@ApiTags("Health")
@Controller("api/health")
export class HealthController {
  /**
   * Initializes an instance of HealthController.
   */
  constructor() {
    Logger.debug("Initialized HealthController");
  }

  /**
   * Health endpoint.
   *
   * @returns A 200 Ok response.
   */
  @Get()
  @ApiOkResponse()
  @SkipAuth()
  async getHealth() {
    return `Healthy! v${process.env.npm_package_version}`;
  }
}
