import { CallToolResult } from "@modelcontextprotocol/sdk/types";

export const resultOrEmptyText = (
  results: any[],
  emptyMessage: string
): CallToolResult => {
  if (results.length === 0) {
    return {
      content: [{ type: "text", text: emptyMessage }],
    };
  }
  return { content: [{ type: "text", text: JSON.stringify(results) }] };
};
