import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { UsersService } from "../../users/users.service";

import { toToolResult } from "./result";

const usersGetByDiscordIdInputSchema = {
  discordId: z.string().min(1),
};

/**
 * Registers the read-only Users tools on the given MCP server.
 *
 * @param server The MCP server instance.
 * @param users The UsersService used to satisfy tool calls.
 */
export function registerUsersTools(
  server: McpServer,
  users: UsersService,
): void {
  server.registerTool(
    "users_get_by_discord_id",
    {
      title: "Get an OWS user by Discord ID",
      description:
        "Fetch a single OrgBookClub user by their Discord user ID (NOT the " +
        "Mongo object ID). Returns the user document as JSON, or null if no " +
        "user exists with that Discord ID.",
      inputSchema: usersGetByDiscordIdInputSchema,
    },
    async ({ discordId }) => {
      const result = await users.findOneByUserId(discordId);
      return toToolResult(result);
    },
  );
}
