import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { groups, features } from "web-features";
import { z } from "zod";

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

  server.registerTool(
    "get_features_by_group",
    {
      description:
        'Gets all web features in a specific group, such as "css" or "javascript". This is useful for exploring features within a certain technology. Input should be the group name as a string.',
      inputSchema: {
        groupName: z.string(),
      },
    },
    async ({ groupName }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (
          "group" in feature &&
          feature.group &&
          feature.group.includes(groupName)
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No features found for group "${groupName}". Please ensure the group name is correct.`,
            },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );
};
