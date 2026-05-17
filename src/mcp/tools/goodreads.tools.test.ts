import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { GoodreadsService } from "../../book-info/goodreads.service";

import { registerGoodreadsTools } from "./goodreads.tools";

type GoodreadsServiceMock = Pick<
  GoodreadsService,
  "searchBooks" | "getBook"
> & {
  searchBooks: jest.Mock;
  getBook: jest.Mock;
};

const setup = async (
  goodreadsMock: GoodreadsServiceMock,
): Promise<{ client: Client; teardown: () => Promise<void> }> => {
  const server = new McpServer({ name: "test-server", version: "0.0.0" });
  registerGoodreadsTools(server, goodreadsMock as unknown as GoodreadsService);
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

describe("registerGoodreadsTools", () => {
  let goodreadsMock: GoodreadsServiceMock;

  beforeEach(() => {
    goodreadsMock = {
      searchBooks: jest.fn().mockResolvedValue([]),
      getBook: jest.fn().mockResolvedValue(null),
    };
  });

  describe("goodreads_search_and_get_book", () => {
    it("returns the top match's full book details", async () => {
      const summary = {
        title: "Piranesi",
        url: "https://goodreads.com/book/1",
      };
      const book = { title: "Piranesi", description: "House." };
      goodreadsMock.searchBooks.mockResolvedValueOnce([summary]);
      goodreadsMock.getBook.mockResolvedValueOnce(book);
      const { client, teardown } = await setup(goodreadsMock);
      try {
        const result = await client.callTool({
          name: "goodreads_search_and_get_book",
          arguments: { q: "Piranesi" },
        });
        expect(goodreadsMock.searchBooks).toHaveBeenCalledWith("Piranesi", 1);
        expect(goodreadsMock.getBook).toHaveBeenCalledWith(summary.url);
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(book) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("returns a not_found envelope when search yields nothing", async () => {
      goodreadsMock.searchBooks.mockResolvedValueOnce([]);
      const { client, teardown } = await setup(goodreadsMock);
      try {
        const result = await client.callTool({
          name: "goodreads_search_and_get_book",
          arguments: { q: "ZZZZ-not-real-book" },
        });
        expect(goodreadsMock.getBook).not.toHaveBeenCalled();
        expect(result.content).toEqual([
          {
            type: "text",
            text: JSON.stringify({
              error: "not_found",
              detail: 'Goodreads has no match for "ZZZZ-not-real-book".',
            }),
          },
        ]);
      } finally {
        await teardown();
      }
    });

    it("rejects an empty query", async () => {
      const { client, teardown } = await setup(goodreadsMock);
      try {
        const result = await client.callTool({
          name: "goodreads_search_and_get_book",
          arguments: { q: "" },
        });
        expect(result.isError).toBe(true);
        expect(goodreadsMock.searchBooks).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });

  describe("goodreads_search_books", () => {
    it("defaults k to 5 when omitted and wraps the result", async () => {
      const matches = [
        { title: "Book 1", url: "https://goodreads.com/book/1" },
        { title: "Book 2", url: "https://goodreads.com/book/2" },
      ];
      goodreadsMock.searchBooks.mockResolvedValueOnce(matches);
      const { client, teardown } = await setup(goodreadsMock);
      try {
        const result = await client.callTool({
          name: "goodreads_search_books",
          arguments: { q: "Piranesi" },
        });
        expect(goodreadsMock.searchBooks).toHaveBeenCalledWith("Piranesi", 5);
        expect(result.content).toEqual([
          { type: "text", text: JSON.stringify(matches) },
        ]);
      } finally {
        await teardown();
      }
    });

    it("passes through a caller-provided k", async () => {
      goodreadsMock.searchBooks.mockResolvedValueOnce([]);
      const { client, teardown } = await setup(goodreadsMock);
      try {
        await client.callTool({
          name: "goodreads_search_books",
          arguments: { q: "Piranesi", k: 12 },
        });
        expect(goodreadsMock.searchBooks).toHaveBeenCalledWith("Piranesi", 12);
      } finally {
        await teardown();
      }
    });

    it("rejects k outside the allowed range", async () => {
      const { client, teardown } = await setup(goodreadsMock);
      try {
        const result = await client.callTool({
          name: "goodreads_search_books",
          arguments: { q: "Piranesi", k: 999 },
        });
        expect(result.isError).toBe(true);
        expect(goodreadsMock.searchBooks).not.toHaveBeenCalled();
      } finally {
        await teardown();
      }
    });
  });
});
