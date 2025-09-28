import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { snapshots } from "web-features";

export const registerSnapshotTools = (server: McpServer) => {
  server.registerTool(
    "list_snapshots",
    {
      description:
        'Returns a list of all available snapshots. Snapshots are collections of web features, often corresponding to a specific version of a technology (e.g., "ecmascript-2022").',
    },
    async () => {
      return {
        content: [{ type: "text", text: JSON.stringify(snapshots) }],
      };
    }
  );
};
