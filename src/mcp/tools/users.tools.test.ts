import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { UsersService } from "../../users/users.service";

import { registerUsersTools } from "./users.tools";

type UsersServiceMock = Pick<UsersService, "findOneByUserId"> & {
  findOneByUserId: jest.Mock;
};

const setup = async (
  usersMock: UsersServiceMock,
): Promise<{ client: Client; teardown: () => Promise<void> }> => {
  const server = new McpServer({ name: "test-server", version: "0.0.0" });
  registerUsersTools(server, usersMock as unknown as UsersService);
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client(
    { name: "test-client", version: "0.0.0" },
    { capabilities: {} },
  );
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return {
    client,
    teardown: async () => {
      await client.close();
      await server.close();
    },
  };
};

describe("registerUsersTools", () => {
  let usersMock: UsersServiceMock;

  beforeEach(() => {
    usersMock = {
      findOneByUserId: jest.fn().mockResolvedValue({
        _id: "u-1",
        userId: "discord-1",
      }),
    };
  });

  describe("users_get_by_discord_id", () => {
    it("calls findOneByUserId with the given discord id and wraps the result", async () => {
      const doc = { _id: "u-1", userId: "discord-1", name: "alice" };
      usersMock.findOneByUserId.mockResolvedValueOnce(doc);
      const { client, teardown } = await setup(usersMock);
      try {
        const result = await client.callTool({
          name: "users_get_by_discord_id",
          arguments: { discordId: "discord-1" },
        });
        expect(usersMock.findOneByUserId).toHaveBeenCalledWith("discord-1");
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(doc) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("returns a JSON null when the user does not exist", async () => {
      usersMock.findOneByUserId.mockResolvedValueOnce(null);
      const { client, teardown } = await setup(usersMock);
      try {
        const result = await client.callTool({
          name: "users_get_by_discord_id",
          arguments: { discordId: "missing" },
        });
        expect(result.content).toEqual([{ type: "text", text: "null" }]);
      } finally {
        await teardown();
      }
    });

    it("rejects an empty discord id", async () => {
      const { client, teardown } = await setup(usersMock);
      try {
        const result = await client.callTool({
          name: "users_get_by_discord_id",
          arguments: { discordId: "" },
        });
        expect(result.isError).toBe(true);
        expect(usersMock.findOneByUserId).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });
});
