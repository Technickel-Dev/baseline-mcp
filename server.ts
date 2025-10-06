import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFeatureTools } from "./tools/feature.js";
import { registerBrowserTools } from "./tools/browser.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerSnapshotTools } from "./tools/snapshot.js";
import { registerPrompts } from "./prompts/prompts.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

const server: McpServer = new McpServer({
  name: "baseline-mcp",
  version: "1.0.0",
  description: "A server for querying baseline web features data.",
});

registerFeatureTools(server);
registerBrowserTools(server);
registerGroupTools(server);
registerSnapshotTools(server);
registerPrompts(server);

// const transport = new StdioServerTransport();
// await server.connect(transport);


app.post("/mcp", async (req, res) => {
  // In stateless mode, create a new transport for each request to prevent
  // request ID collisions. Different clients may use the same JSON-RPC request IDs,
  // which would cause responses to be routed to the wrong HTTP connections if
  // the transport state is shared.

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

const port = parseInt(process.env.PORT || "3000");
app
  .listen(port, () => {
    console.log(`MCP Server running on http://localhost:${port}/mcp`);
  })
  .on("error", (error: any) => {
    console.error("Server error:", error);
    process.exit(1);
  });