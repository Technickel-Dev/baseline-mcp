import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { groups } from "web-features";

export const registerGroupTools = (server: McpServer) => {
  server.registerTool(
    "get_feature_groups",
    {
      description:
        'Returns a list of all available feature groups. These groups categorize features by technology (e.g., "css", "javascript").',
    },
    async () => {
      return { content: [{ type: "text", text: JSON.stringify(groups) }] };
    }
  );
};
