import { Module } from "@nestjs/common";

import { EventsModule } from "../events/events.module";
import { UsersModule } from "../users/users.module";

import { McpController } from "./mcp.controller";
import { McpService } from "./mcp.service";

/**
 * The MCP Module.
 * Wires the Model Context Protocol Streamable HTTP endpoint into the Nest app.
 * Tools are backed by the existing feature services injected via DI.
 */
@Module({
  imports: [EventsModule, UsersModule],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
