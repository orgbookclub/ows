import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { StorygraphService } from "../../book-info/storygraph.service";

import { registerStorygraphTools } from "./storygraph.tools";

type StorygraphServiceMock = Pick<
  StorygraphService,
  "searchBooks" | "getBook"
> & {
  searchBooks: jest.Mock;
  getBook: jest.Mock;
};

const setup = async (
  storygraphMock: StorygraphServiceMock,
): Promise<{ client: Client; teardown: () => Promise<void> }> => {
  const server = new McpServer({ name: "test-server", version: "0.0.0" });
  registerStorygraphTools(
    server,
    storygraphMock as unknown as StorygraphService,
  );
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

describe("registerStorygraphTools", () => {
  let storygraphMock: StorygraphServiceMock;

  beforeEach(() => {
    storygraphMock = {
      searchBooks: jest.fn().mockResolvedValue([]),
      getBook: jest.fn().mockResolvedValue(null),
    };
  });

  describe("storygraph_search_and_get_book", () => {
    it("returns the top match's full book details", async () => {
      const summary = {
        title: "Piranesi",
        url: "https://app.thestorygraph.com/books/1",
      };
      const book = { title: "Piranesi", moods: ["reflective"] };
      storygraphMock.searchBooks.mockResolvedValueOnce([summary]);
      storygraphMock.getBook.mockResolvedValueOnce(book);
      const { client, teardown } = await setup(storygraphMock);
      try {
        const result = await client.callTool({
          name: "storygraph_search_and_get_book",
          arguments: { q: "Piranesi" },
        });
        expect(storygraphMock.searchBooks).toHaveBeenCalledWith("Piranesi", 1);
        expect(storygraphMock.getBook).toHaveBeenCalledWith(summary.url);
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(book) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("returns a not_found envelope when search yields nothing", async () => {
      storygraphMock.searchBooks.mockResolvedValueOnce([]);
      const { client, teardown } = await setup(storygraphMock);
      try {
        const result = await client.callTool({
          name: "storygraph_search_and_get_book",
          arguments: { q: "ZZZZ-not-real-book" },
        });
        expect(storygraphMock.getBook).not.toHaveBeenCalled();
        expect(result.content).toEqual([
          {
            type: "text",
            text: JSON.stringify({
              error: "not_found",
              detail: 'Storygraph has no match for "ZZZZ-not-real-book".',
            }),
          },
        ]);
      } finally {
        await teardown();
      }
    });

    it("rejects an empty query", async () => {
      const { client, teardown } = await setup(storygraphMock);
      try {
        const result = await client.callTool({
          name: "storygraph_search_and_get_book",
          arguments: { q: "" },
        });
        expect(result.isError).toBe(true);
        expect(storygraphMock.searchBooks).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });

  describe("storygraph_search_books", () => {
    it("defaults k to 5 when omitted and wraps the result", async () => {
      const matches = [
        { title: "Book 1", url: "https://app.thestorygraph.com/books/1" },
        { title: "Book 2", url: "https://app.thestorygraph.com/books/2" },
      ];
      storygraphMock.searchBooks.mockResolvedValueOnce(matches);
      const { client, teardown } = await setup(storygraphMock);
      try {
        const result = await client.callTool({
          name: "storygraph_search_books",
          arguments: { q: "Piranesi" },
        });
        expect(storygraphMock.searchBooks).toHaveBeenCalledWith("Piranesi", 5);
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(matches) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("passes through a caller-provided k", async () => {
      storygraphMock.searchBooks.mockResolvedValueOnce([]);
      const { client, teardown } = await setup(storygraphMock);
      try {
        await client.callTool({
          name: "storygraph_search_books",
          arguments: { q: "Piranesi", k: 12 },
        });
        expect(storygraphMock.searchBooks).toHaveBeenCalledWith("Piranesi", 12);
      } finally {
        await teardown();
      }
    });

    it("rejects k outside the allowed range", async () => {
      const { client, teardown } = await setup(storygraphMock);
      try {
        const result = await client.callTool({
          name: "storygraph_search_books",
          arguments: { q: "Piranesi", k: 999 },
        });
        expect(result.isError).toBe(true);
        expect(storygraphMock.searchBooks).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });
});
