import { Resource } from "@modelcontextprotocol/sdk";
import { groups } from "web-features";

export const featureGroupsResource = new Resource("feature_groups", {
  description: 'Returns a list of all available feature groups. These groups categorize features by technology (e.g., "css", "javascript").',
  get: async () => {
    return Object.keys(groups);
  }
});
