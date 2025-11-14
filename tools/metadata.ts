import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resultOrEmptyText } from "../lib/mcp.js";
import { z } from "zod";
import metadata from "./data/combined-data.json";

export function registerMetadataTools(server: McpServer) {
  server.registerTool(
    "get-feature-metadata",
    {
      description:
        "Gets the metadata for a specific web feature. Available metadata types include: wpt (Web Platform Test results), mdn-docs (MDN documentation), developer-signals (developer interest), chrome-use-counters (Chrome usage statistics), interop (Interop status), standards-positions (browser vendor positions), and state-of-surveys (developer survey data).",
      inputSchema: { featureId: z.string() },
    },
    async ({ featureId }: { featureId: string }) => {
      const featureMetadata = (metadata as any)[featureId];

      return resultOrEmptyText(
        featureMetadata ? [featureMetadata] : [],
        `Could not find metadata for feature ${featureId}`
      );
    }
  );
}
