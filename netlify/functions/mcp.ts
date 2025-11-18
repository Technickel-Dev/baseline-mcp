import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { JSONRPCError } from "@modelcontextprotocol/sdk/types.js";
import { registerFeatureTools } from "../../tools/feature.js";
import { registerBrowserTools } from "../../tools/browser.js";
import { registerGroupTools } from "../../tools/groups.js";
import { registerSnapshotTools } from "../../tools/snapshot.js";
import { registerMetadataTools } from "../../tools/metadata.js";
import { registerPrompts } from "../../prompts/prompts.js";

export default async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/health")) {
    return new Response("OK", { status: 200 });
  }

  try {
    // for stateless MCP, we'll only use the POST requests that are sent
    // with event information for the init phase and resource/tool requests
    if (req.method === "POST") {
      // Convert the Request object into a Node.js Request object
      const { req: nodeReq, res: nodeRes } = toReqRes(req);
      const server = getServer();

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);

      const body = await req.json();
      await transport.handleRequest(nodeReq, nodeRes, body);

      nodeRes.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });

      return toFetchResponse(nodeRes);
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("MCP error:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: "",
      } satisfies JSONRPCError),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export function getServer(): McpServer {
  const server: McpServer = new McpServer({
    name: "baseline-mcp",
    version: "1.0.0",
    description: "A server for querying baseline web features data.",
  });

  registerFeatureTools(server);
  registerBrowserTools(server);
  registerGroupTools(server);
  registerSnapshotTools(server);
  registerMetadataTools(server);
  registerPrompts(server);

  console.log("Starting MCP server...");

  return server;
}

// Ensure this function responds to the <domain>/mcp path
// This can be any path you want but you'll need to ensure the
// mcp server config you use/share matches this path.
export const config = {
  path: "/mcp",
};
