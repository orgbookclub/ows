import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { StorygraphService } from "../../book-info/storygraph.service";

import { toToolResult } from "./result";

const storygraphSearchAndGetBookInputSchema = {
  q: z.string().min(1),
};

const storygraphSearchBooksInputSchema = {
  q: z.string().min(1),
  k: z.number().int().min(1).max(20).optional(),
};

const DEFAULT_SEARCH_BOOKS_K = 5;

/**
 * Registers the read-only Storygraph tools on the given MCP server.
 * Mirrors the surface of the REST StorygraphController so an MCP client
 * gets the same data without going through HTTP.
 *
 * @param server The MCP server instance.
 * @param storygraph The StorygraphService used to satisfy tool calls.
 */
export function registerStorygraphTools(
  server: McpServer,
  storygraph: StorygraphService,
): void {
  server.registerTool(
    "storygraph_search_and_get_book",
    {
      title: "Search Storygraph and fetch one book",
      description:
        "Searches Storygraph for `q` (title, author, or ISBN), takes the " +
        "top result, and returns its full Storygraph book metadata (title, " +
        "authors, cover URL, description, average rating, page count, " +
        "moods, pace, content warnings, question/answer pairs, Storygraph " +
        "URL). Prefer this when the user asks about pacing, moods, or " +
        "trigger warnings; otherwise goodreads_search_and_get_book is the " +
        "default. Returns an error if Storygraph has no match.",
      inputSchema: storygraphSearchAndGetBookInputSchema,
    },
    async ({ q }) => {
      const bookList = await storygraph.searchBooks(q, 1);
      if (bookList.length === 0) {
        return toToolResult({
          error: "not_found",
          detail: `Storygraph has no match for "${q}".`,
        });
      }
      const book = await storygraph.getBook(bookList[0].url);
      return toToolResult(book);
    },
  );

  server.registerTool(
    "storygraph_search_books",
    {
      title: "Search Storygraph for matching books",
      description:
        "Searches Storygraph for `q` (title, author, or ISBN) and returns " +
        `up to ${DEFAULT_SEARCH_BOOKS_K} candidate matches (configurable via ` +
        "`k`, max 20). Each entry has lightweight bibliographic fields " +
        "(title, authors, URL). Use this when the user's query is " +
        "ambiguous and you want to confirm before fetching one book's full " +
        "details with storygraph_search_and_get_book.",
      inputSchema: storygraphSearchBooksInputSchema,
    },
    async ({ q, k }) => {
      const results = await storygraph.searchBooks(
        q,
        k ?? DEFAULT_SEARCH_BOOKS_K,
      );
      return toToolResult(results);
    },
  );
}
