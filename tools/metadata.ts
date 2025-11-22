import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resultOrEmptyText } from "../lib/mcp.js";
import { z } from "zod";
import metadata from "./data/combined-data.json";

export function registerMetadataTools(server: McpServer) {
  const metadataTypes = [
    ...Object.values(metadata).reduce((acc, feature) => {
      Object.keys(feature).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>()),
  ];

  server.registerTool(
    "get-feature-metadata",
    {
      description: `Gets the metadata for a specific web feature. Available metadata types include: ${metadataTypes.join(
        ", "
      )}.`,
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

  for (const metadataType of metadataTypes) {
    server.registerTool(
      `get-feature-${metadataType.replace("-", "_")}`,
      {
        description: `Gets the ${metadataType} for a specific web feature.`,
        inputSchema: { featureId: z.string() },
      },
      async ({ featureId }: { featureId: string }) => {
        const featureMetadata = (metadata as any)[featureId];
        const typedMetadata = featureMetadata?.[metadataType];

        return resultOrEmptyText(
          typedMetadata ? [typedMetadata] : [],
          `Could not find ${metadataType} for feature ${featureId}`
        );
      }
    );
  }
}
