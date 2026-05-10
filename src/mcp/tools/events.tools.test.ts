import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { EventStatus } from "../../events/dto/event-status";
import { EventType } from "../../events/dto/event-type";
import { EventsService } from "../../events/events.service";

import { registerEventsTools } from "./events.tools";

type EventsServiceMock = Pick<EventsService, "findMany" | "findOne"> & {
  findMany: jest.Mock;
  findOne: jest.Mock;
};

const setup = async (
  eventsMock: EventsServiceMock,
): Promise<{ client: Client; teardown: () => Promise<void> }> => {
  const server = new McpServer({ name: "test-server", version: "0.0.0" });
  registerEventsTools(server, eventsMock as unknown as EventsService);
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

const callEventsSearch = async (
  client: Client,
  args: Record<string, unknown>,
) => client.callTool({ name: "events_search", arguments: args });

describe("registerEventsTools", () => {
  let eventsMock: EventsServiceMock;

  beforeEach(() => {
    eventsMock = {
      findMany: jest.fn().mockResolvedValue([{ _id: "x", name: "a" }]),
      findOne: jest.fn().mockResolvedValue({ _id: "y", name: "b" }),
    };
  });

  describe("events_search", () => {
    it("passes through scalar EventFilter fields unchanged", async () => {
      const { client, teardown } = await setup(eventsMock);
      try {
        await callEventsSearch(client, {
          name: "American Gods",
          bookSearchQuery: "American",
          status: EventStatus.Completed,
          type: EventType.BuddyRead,
          sortBy: "dates.startDate",
        });
        expect(eventsMock.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "American Gods",
            bookSearchQuery: "American",
            status: EventStatus.Completed,
            type: EventType.BuddyRead,
            sortBy: "dates.startDate",
          }),
        );
      } finally {
        await teardown();
      }
    });

    it("passes through array id-list filters unchanged", async () => {
      const { client, teardown } = await setup(eventsMock);
      try {
        await callEventsSearch(client, {
          bookIds: ["b1", "b2"],
          threads: ["t1"],
          participantIds: ["u1"],
          requestedByIds: ["u2"],
          interestedIds: ["u3"],
          readerIds: ["u4"],
          leaderIds: ["u5"],
        });
        expect(eventsMock.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            bookIds: ["b1", "b2"],
            threads: ["t1"],
            participantIds: ["u1"],
            requestedByIds: ["u2"],
            interestedIds: ["u3"],
            readerIds: ["u4"],
            leaderIds: ["u5"],
          }),
        );
      } finally {
        await teardown();
      }
    });

    it("converts ISO date strings to Date instances on all four date fields", async () => {
      const { client, teardown } = await setup(eventsMock);
      try {
        const iso = "2024-01-15T00:00:00.000Z";
        await callEventsSearch(client, {
          startDateBefore: iso,
          startDateAfter: iso,
          endDateBefore: iso,
          endDateAfter: iso,
        });
        const filter = eventsMock.findMany.mock.calls[0][0];
        for (const key of [
          "startDateBefore",
          "startDateAfter",
          "endDateBefore",
          "endDateAfter",
        ]) {
          expect(filter[key]).toBeInstanceOf(Date);
          expect((filter[key] as Date).toISOString()).toBe(iso);
        }
      } finally {
        await teardown();
      }
    });

    it("passes an empty filter when no args are given", async () => {
      const { client, teardown } = await setup(eventsMock);
      try {
        await callEventsSearch(client, {});
        expect(eventsMock.findMany).toHaveBeenCalledTimes(1);
        const filter = eventsMock.findMany.mock.calls[0][0];
        for (const value of Object.values(filter)) {
          expect(value).toBeUndefined();
        }
      } finally {
        await teardown();
      }
    });

    it("returns the service result as JSON in a text content block", async () => {
      const docs = [{ _id: "a", name: "x" }];
      eventsMock.findMany.mockResolvedValueOnce(docs);
      const { client, teardown } = await setup(eventsMock);
      try {
        const result = await callEventsSearch(client, {});
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(docs) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("rejects invalid enum values via the tool input schema", async () => {
      const { client, teardown } = await setup(eventsMock);
      try {
        const result = await callEventsSearch(client, { status: "Bogus" });
        expect(result.isError).toBe(true);
        expect(eventsMock.findMany).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });

  describe("events_get_by_id", () => {
    it("calls findOne with the given id and wraps the result", async () => {
      const doc = { _id: "evt-1", name: "n" };
      eventsMock.findOne.mockResolvedValueOnce(doc);
      const { client, teardown } = await setup(eventsMock);
      try {
        const result = await client.callTool({
          name: "events_get_by_id",
          arguments: { id: "evt-1" },
        });
        expect(eventsMock.findOne).toHaveBeenCalledWith("evt-1");
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(doc) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("rejects an empty id", async () => {
      const { client, teardown } = await setup(eventsMock);
      try {
        const result = await client.callTool({
          name: "events_get_by_id",
          arguments: { id: "" },
        });
        expect(result.isError).toBe(true);
        expect(eventsMock.findOne).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });
});
