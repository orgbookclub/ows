import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Test, TestingModule } from "@nestjs/testing";

import { EventsService } from "../events/events.service";
import { UsersService } from "../users/users.service";

import { McpService } from "./mcp.service";

const stubEventsService = {
  findManyV2: jest
    .fn()
    .mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 }),
  findOne: jest.fn().mockResolvedValue(null),
};

const stubUsersService = {
  findOneByUserId: jest.fn().mockResolvedValue(null),
};

describe("McpService", () => {
  let service: McpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        { provide: EventsService, useValue: stubEventsService },
        { provide: UsersService, useValue: stubUsersService },
      ],
    }).compile();
    service = module.get<McpService>(McpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("buildServer", () => {
    it("should expose exactly the expected tool catalog", async () => {
      const server = service.buildServer();
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

      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name).sort();
      expect(names).toEqual([
        "events_get_by_id",
        "events_search",
        "users_get_by_discord_id",
      ]);

      await client.close();
      await server.close();
    });

    it("should return a fresh server instance per call", () => {
      const a = service.buildServer();
      const b = service.buildServer();
      expect(a).not.toBe(b);
    });
  });
});
