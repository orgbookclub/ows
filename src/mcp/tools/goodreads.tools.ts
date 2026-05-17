import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GoodreadsService } from "../../book-info/goodreads.service";

import { toToolResult } from "./result";

const goodreadsSearchAndGetBookInputSchema = {
  q: z.string().min(1),
};

const goodreadsSearchBooksInputSchema = {
  q: z.string().min(1),
  k: z.number().int().min(1).max(20).optional(),
};

const DEFAULT_SEARCH_BOOKS_K = 5;

/**
 * Registers the read-only Goodreads tools on the given MCP server.
 * Mirrors the surface of the REST GoodreadsController so an MCP client
 * gets the same data without going through HTTP.
 *
 * @param server The MCP server instance.
 * @param goodreads The GoodreadsService used to satisfy tool calls.
 */
export function registerGoodreadsTools(
  server: McpServer,
  goodreads: GoodreadsService,
): void {
  server.registerTool(
    "goodreads_search_and_get_book",
    {
      title: "Search Goodreads and fetch one book",
      description:
        "Searches Goodreads for `q` (title, author, or ISBN), takes the " +
        "top result, and returns its full Goodreads book metadata (title, " +
        "authors, cover URL, description, average rating, page count, " +
        "genres, series, Goodreads URL). Use this to ground answers about " +
        "a specific book in OBC's preferred bibliographic source. Returns " +
        "an error if Goodreads has no match.",
      inputSchema: goodreadsSearchAndGetBookInputSchema,
    },
    async ({ q }) => {
      const bookList = await goodreads.searchBooks(q, 1);
      if (bookList.length === 0) {
        return toToolResult({
          error: "not_found",
          detail: `Goodreads has no match for "${q}".`,
        });
      }
      const book = await goodreads.getBook(bookList[0].url);
      return toToolResult(book);
    },
  );

  server.registerTool(
    "goodreads_search_books",
    {
      title: "Search Goodreads for matching books",
      description:
        "Searches Goodreads for `q` (title, author, or ISBN) and returns " +
        `up to ${DEFAULT_SEARCH_BOOKS_K} candidate matches (configurable via ` +
        "`k`, max 20). Each entry has lightweight bibliographic fields " +
        "(title, authors, URL). Use this when the user's query is " +
        "ambiguous and you want to confirm before fetching one book's full " +
        "details with goodreads_search_and_get_book.",
      inputSchema: goodreadsSearchBooksInputSchema,
    },
    async ({ q, k }) => {
      const results = await goodreads.searchBooks(
        q,
        k ?? DEFAULT_SEARCH_BOOKS_K,
      );
      return toToolResult(results);
    },
  );
}
