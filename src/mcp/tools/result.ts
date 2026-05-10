import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Wraps an arbitrary value into the MCP CallToolResult content envelope.
 * Shared by all tool handlers so they have a consistent response shape.
 *
 * @param value The value to serialize.
 * @returns A CallToolResult whose single text content is the JSON-encoded value.
 */
export function toToolResult(value: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
  };
}
