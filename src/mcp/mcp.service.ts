import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Injectable, Logger } from "@nestjs/common";

import { EventsService } from "../events/events.service";
import { UsersService } from "../users/users.service";

import { registerEventsTools } from "./tools/events.tools";
import { registerUsersTools } from "./tools/users.tools";

const MCP_SERVER_NAME = "ows-mcp";
const MCP_SERVER_VERSION = "0.1.0";

/**
 * The MCP Service.
 * Builds a fresh @see McpServer instance per request with the OWS tool catalog
 * registered. Tools delegate to the underlying Nest providers via DI.
 */
@Injectable()
export class McpService {
  /**
   * Initializes an instance of McpService.
   *
   * @param eventsService Service backing the events_* tools.
   * @param usersService Service backing the users_* tools.
   */
  constructor(
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
  ) {
    Logger.debug("Initialized McpService");
  }

  /**
   * Builds a new MCP server with the OWS tool catalog registered.
   * A fresh instance is returned for every call so it can be safely paired
   * with a per-request transport in stateless mode.
   *
   * @returns A configured McpServer ready to be connected to a transport.
   */
  buildServer(): McpServer {
    const server = new McpServer({
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    });
    registerEventsTools(server, this.eventsService);
    registerUsersTools(server, this.usersService);
    return server;
  }
}
