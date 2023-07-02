import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";

/**
 * Module for health endpoint.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
