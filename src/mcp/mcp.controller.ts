import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Request, Response } from "express";

import { Scopes } from "../auth/scopes.decorator";

import { McpService } from "./mcp.service";

const METHOD_NOT_ALLOWED_BODY = {
  jsonrpc: "2.0",
  error: { code: -32000, message: "Method not allowed." },
  id: null,
};

/**
 * The MCP Controller.
 * Exposes the Model Context Protocol Streamable HTTP transport at POST /mcp.
 * Runs in stateless mode: every request gets a fresh transport and server.
 * GET and DELETE return 405 because no standalone SSE stream is offered.
 */
@ApiExcludeController()
@Controller("mcp")
export class McpController {
  /**
   * Initializes an instance of McpController.
   *
   * @param mcpService The MCP service that builds per-request server instances.
   */
  constructor(private readonly mcpService: McpService) {
    Logger.debug("Initialized McpController");
  }

  /**
   * Handles MCP POST requests by routing them through a fresh
   * StreamableHTTPServerTransport instance.
   *
   * @param req The Express request.
   * @param res The Express response, owned by the transport.
   * @param body The pre-parsed JSON-RPC request body.
   */
  @Post()
  @Scopes("events:read", "users:read", "books:read")
  async handle(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    const server = this.mcpService.buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (error) {
      Logger.error(`MCP request failed: ${error}`, undefined, "McpController");
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error." },
          id: null,
        });
      }
    }
  }

  /**
   * Rejects MCP GET requests with 405 Method Not Allowed (stateless mode has
   * no standalone SSE stream).
   *
   * @returns The JSON-RPC method-not-allowed body.
   */
  @Get()
  @HttpCode(405)
  rejectGet() {
    return METHOD_NOT_ALLOWED_BODY;
  }

  /**
   * Rejects MCP DELETE requests with 405 Method Not Allowed (stateless mode
   * has no session to terminate).
   *
   * @returns The JSON-RPC method-not-allowed body.
   */
  @Delete()
  @HttpCode(405)
  rejectDelete() {
    return METHOD_NOT_ALLOWED_BODY;
  }
}
