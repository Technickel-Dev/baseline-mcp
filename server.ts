import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFeatureTools } from "./tools/feature.js";
import { registerBrowserTools } from "./tools/browser.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerSnapshotTools } from "./tools/snapshot.js";

const server: McpServer = new McpServer({
  name: "baseline-mcp",
  version: "1.0.0",
  description: "A server for querying baseline web features data.",
});

registerFeatureTools(server);
registerBrowserTools(server);
registerGroupTools(server);
registerSnapshotTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
