#!\usr\bin\env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getServer } from "./netlify/functions/mcp.js";

const server: McpServer = getServer();

const transport = new StdioServerTransport();
await server.connect(transport);
