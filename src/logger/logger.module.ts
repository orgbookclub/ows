import { Module } from "@nestjs/common";

import { CustomLogger } from "./CustomLogger";

/**
 * A Logger Module, for using CustomLogger.
 */
@Module({
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
