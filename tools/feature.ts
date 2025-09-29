import { features } from "web-features";
import {
  tokenize,
  getTermFrequencies,
  cosineSimilarity,
} from "../lib/text-processing.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resultOrEmptyText } from "../lib/mcp.js";
import { findFeaturesInContent } from "../lib/feature.js";

export const registerFeatureTools = (server: McpServer) => {
  server.registerTool(
    "list-features",
    {
      description:
        "Returns a list of all available baseline web features. Baseline features are a set of web platform features that are at different levels of support across major browsers.",
    },
    async ({}) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(features),
          },
        ],
      };
    }
  );

  server.registerTool(
    "discouraged-features",
    {
      description:
        "Returns a list of all web features that are discouraged from use. This is important for avoiding obsolete or problematic features.",
    },
    async ({}) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if ("discouraged" in feature && feature.discouraged) {
          results.push({
            id: featureId,
            name: feature.name,
            discouraged: feature.discouraged,
          });
        }
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get-feature-details",
    {
      description:
        "Gets all the details for a specific web feature, including its name, description, specification URL, and support status.",
      inputSchema: { featureId: z.string() },
    },
    async ({ featureId }) => {
      const feature = features[featureId as keyof typeof features];
      if (!feature) {
        return {
          content: [
            {
              type: "text",
              text: `Feature with ID '${featureId}' not found.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(feature),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get-feature-by-status",
    {
      description:
        'Gets all web features with a specific baseline status. The status can be "high" (widely supported), "low" (newly supported), or false (not baseline). This helps in understanding the maturity of a feature.',
      inputSchema: {
        status: z
          .union([z.literal("high"), z.literal("low"), z.literal(false)])
          .describe(
            'The baseline status to filter by: "high", "low", or false.'
          ),
      },
    },
    async ({ status }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if ("status" in feature && feature.status.baseline === status) {
          results.push({
            id: featureId,
            name: feature.name,
            status: feature.status,
          });
        }
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_features_by_caniuse_id",
    {
      description:
        "Gets a web-features feature by its corresponding caniuse.com feature ID. Caniuse.com is a popular website for checking browser support for web features.",
      inputSchema: { caniuseId: z.string() },
    },
    async ({ caniuseId }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "caniuse" in feature &&
          feature.caniuse &&
          feature.caniuse.includes(caniuseId)
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }

      return resultOrEmptyText(
        results,
        `No features found for caniuse ID "${caniuseId}". Please ensure the ID is correct.`
      );
    }
  );

  server.registerTool(
    "get_features_with_spec_url",
    {
      description:
        "Gets all web features that reference a specific specification URL. This is useful for finding features defined in a particular web standard.",
      inputSchema: { specUrl: z.string() },
    },
    async ({ specUrl }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "spec" in feature &&
          feature.spec &&
          feature.spec.includes(specUrl)
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }

      return resultOrEmptyText(
        results,
        `No features found for spec URL "${specUrl}". Please ensure the URL is correct.`
      );
    }
  );

  server.registerTool(
    "get_features_by_compat_feature",
    {
      description:
        "Gets a web-features feature by its corresponding @mdn/browser-compat-data feature key. This data is used by the Mozilla Developer Network (MDN) to display browser compatibility tables.",
      inputSchema: { compatFeature: z.string() },
    },
    async ({ compatFeature }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "compat_features" in feature &&
          feature.compat_features &&
          feature.compat_features.includes(compatFeature)
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }

      return resultOrEmptyText(
        results,
        `No features found for compat feature "${compatFeature}". Please ensure the feature key is correct.`
      );
    }
  );

  server.registerTool(
    "get_baseline_high_since",
    {
      description:
        'Gets all web features that reached "baseline high" status (widely supported) since a given date. This helps track the adoption of new features over time.',
      inputSchema: {
        dateString: z.string().describe("Date in YYYY-MM-DD format"),
      },
    },
    async ({ dateString }) => {
      const sinceDate = new Date(dateString);
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status.baseline === "high" &&
          feature.status.baseline_high_date &&
          new Date(feature.status.baseline_high_date) >= sinceDate
        ) {
          results.push({
            id: featureId,
            name: feature.name,
            baseline_high_date: feature.status.baseline_high_date,
          });
        }
      }

      return resultOrEmptyText(
        results,
        `No features found that reached "baseline high" status since ${dateString}. Please ensure the date is correct and in YYYY-MM-DD format.`
      );
    }
  );

  server.registerTool(
    "get_baseline_low_since",
    {
      description:
        'Gets all web features that reached "baseline low" status (newly supported) since a given date. This helps track the emergence of new features.',
      inputSchema: {
        dateString: z.string().describe("Date in YYYY-MM-DD format"),
      },
    },
    async ({ dateString }) => {
      const sinceDate = new Date(dateString);
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status.baseline === "low" &&
          feature.status.baseline_low_date &&
          new Date(feature.status.baseline_low_date) >= sinceDate
        ) {
          results.push({
            id: featureId,
            name: feature.name,
            baseline_low_date: feature.status.baseline_low_date,
          });
        }
      }

      return resultOrEmptyText(
        results,
        `No features found that reached "baseline low" status since ${dateString}. Please ensure the date is correct and in YYYY-MM-DD format.`
      );
    }
  );

  server.registerTool(
    "get_baseline_low_last_30_days",
    {
      description:
        "Gets all web features that reached 'baseline low' status in the last 30 days.",
    },
    async ({}) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status.baseline === "low" &&
          feature.status.baseline_low_date &&
          new Date(feature.status.baseline_low_date) >= thirtyDaysAgo
        ) {
          results.push({
            id: featureId,
            name: feature.name,
            baseline_low_date: feature.status.baseline_low_date,
          });
        }
      }

      return resultOrEmptyText(
        results,
        "No features found that reached 'baseline low' status in the last 30 days."
      );
    }
  );

  server.registerTool(
    "get_baseline_high_last_30_days",
    {
      description:
        "Gets all web features that reached 'baseline high' status in the last 30 days.",
    },
    async ({}) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status.baseline === "high" &&
          feature.status.baseline_high_date &&
          new Date(feature.status.baseline_high_date) >= thirtyDaysAgo
        ) {
          results.push({
            id: featureId,
            name: feature.name,
            baseline_high_date: feature.status.baseline_high_date,
          });
        }
      }

      return resultOrEmptyText(
        results,
        "No features found that reached 'baseline high' status in the last 30 days."
      );
    }
  );

  server.registerTool(
    "get_baseline_status_changes_last_30_days",
    {
      description:
        "Lists all web features that have changed their baseline status in the last 30 days, showing the transition.",
    },
    async ({}) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status.baseline === "high" &&
          feature.status.baseline_high_date &&
          new Date(feature.status.baseline_high_date) >= thirtyDaysAgo
        ) {
          results.push({
            id: featureId,
            name: feature.name,
            transition: "Promoted to Widely Supported",
            new_status: "high",
            old_status: "low",
            change_date: feature.status.baseline_high_date,
          });
        }
        if (
          "status" in feature &&
          feature.status.baseline === "low" &&
          feature.status.baseline_low_date &&
          new Date(feature.status.baseline_low_date) >= thirtyDaysAgo
        ) {
          results.push({
            id: featureId,
            name: feature.name,
            transition: "Newly Baseline",
            new_status: "low",
            old_status: false,
            change_date: feature.status.baseline_low_date,
          });
        }
      }

      const sortedResults = results.sort(
        (a, b) =>
          new Date(b.change_date!).getTime() -
          new Date(a.change_date!).getTime()
      );

      return resultOrEmptyText(
        sortedResults,
        "No features found that changed their baseline status in the last 30 days."
      );
    }
  );

  server.registerTool(
    "get_features_by_description_keyword",
    {
      description:
        "Searches for a keyword only in the description of the web features. This allows for a more targeted search than the general suggest_baseline_feature tool.",
      inputSchema: { keyword: z.string() },
    },
    async ({ keyword }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if ("description" in feature) {
          const description = feature.description || "";
          if (description.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({ id: featureId, name: feature.name, description });
          }
        }
      }
      return resultOrEmptyText(
        results,
        `No features found with the keyword "${keyword}".`
      );
    }
  );

  server.registerTool(
    "get_features_by_name_keyword",
    {
      description:
        "Searches for a keyword only in the name of the web features. This allows for a more targeted search.",
      inputSchema: { keyword: z.string() },
    },
    async ({ keyword }) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if ("name" in feature) {
          const name = feature.name || "";
          if (name.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({ id: featureId, name });
          }
        }
      }
      return resultOrEmptyText(
        results,
        `No features found with the keyword "${keyword}".`
      );
    }
  );

  server.registerTool(
    "get_features_with_multiple_spec_urls",
    {
      description:
        "Returns web features that have more than one specification URL. This can indicate that a feature is defined across multiple standards.",
    },
    async ({}) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if ("spec" in feature && feature.spec && feature.spec.length > 1) {
          results.push({
            id: featureId,
            name: feature.name,
            spec: feature.spec,
          });
        }
      }
      return resultOrEmptyText(
        results,
        "No features found with more than one specification URL."
      );
    }
  );

  server.registerTool(
    "get_features_with_no_spec_url",
    {
      description:
        "Returns web features that have no specification URL. This may indicate that a feature is non-standard.",
    },
    async ({}) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          !("spec" in feature) ||
          !feature.spec ||
          feature.spec.length === 0
        ) {
          results.push({
            id: featureId,
            name: "name" in feature ? feature.name : featureId,
          });
        }
      }
      return resultOrEmptyText(
        results,
        "No features found with no specification URL."
      );
    }
  );

  server.registerTool(
    "get_features_with_alternatives",
    {
      description:
        "Returns all discouraged web features that have recommended alternatives.",
    },
    async ({}) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if ("discouraged" in feature && feature.discouraged) {
          if (
            "alternatives" in feature.discouraged &&
            feature.discouraged.alternatives &&
            feature.discouraged.alternatives.length > 0
          ) {
            results.push({
              id: featureId,
              name: feature.name,
              alternatives: feature.discouraged.alternatives,
            });
          }
        }
      }
      return resultOrEmptyText(
        results,
        "No features found with recommended alternatives."
      );
    }
  );

  server.registerTool(
    "get_feature_alternative",
    {
      description:
        "Gets the recommended alternatives for a discouraged web feature.",
      inputSchema: { featureId: z.string() },
    },
    async ({ featureId }) => {
      const feature = features[featureId as keyof typeof features];
      if (!feature || !("discouraged" in feature) || !feature.discouraged) {
        return {
          content: [
            {
              type: "text",
              text: `Feature with ID '${featureId}' not found or is not discouraged.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(feature.discouraged.alternatives),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_random_feature",
    { description: "Returns a random web feature. Useful for discovery." },
    async ({}) => {
      const featureIds = Object.keys(features);
      const randomId =
        featureIds[Math.floor(Math.random() * featureIds.length)];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(features[randomId as keyof typeof features]),
          },
        ],
      };
    }
  );

  server.registerTool(
    "list_features_in_file",
    {
      description:
        "Analyzes the provided file content and lists the baseline web features used within it. This tool performs a simplified analysis based on keywords, HTML tags, CSS properties, and JavaScript API calls. It is not a full-fledged parser and may not identify all features or may produce false positives.",
      inputSchema: { fileContent: z.string(), fileType: z.string().optional() },
    },
    async ({ fileContent, fileType }) => {
      const foundFeatures = findFeaturesInContent(fileContent, fileType);

      if (Object.keys(foundFeatures).length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No web features detected in the file.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(foundFeatures),
          },
        ],
      };
    }
  );

  server.registerTool(
    "suggest_baseline_feature",
    {
      description:
        "Suggests a baseline web feature based on a query using keyword matching. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites. This tool helps you find the right feature for what you are trying to build.",
      inputSchema: { query: z.string() },
    },
    async ({ query }) => {
      const queryLower = query.toLowerCase();
      const queryTokens = tokenize(query);
      const queryTf = getTermFrequencies(queryTokens);

      const keywordResults = new Set();
      const semanticResults = [];

      for (const featureId in features) {
        const feature = features[featureId];

        if (!("name" in feature) || !("description" in feature)) continue;

        const name = feature.name || "";
        const description = feature.description || "";

        // Keyword matching
        if (
          name.toLowerCase().includes(queryLower) ||
          description.toLowerCase().includes(queryLower)
        ) {
          keywordResults.add(featureId);
        }

        // Semantic similarity (cosine similarity)
        const score = cosineSimilarity(
          queryTf,
          getTermFrequencies(tokenize(name + " " + description))
        );
        if (score > 0) {
          semanticResults.push({
            id: featureId,
            name: name,
            description: description,
            score: score,
          });
        }
      }

      // Sort semantic results by score
      semanticResults.sort((a, b) => b.score - a.score);

      // Combine results: prioritize keyword matches, then semantic matches
      const combinedResults = [];
      const addedIds = new Set();

      // Add keyword matches first
      for (const featureId of keywordResults) {
        if (!addedIds.has(featureId)) {
          const feature = features[featureId as keyof typeof features];

          if (!("name" in feature) || !("description" in feature)) continue;

          combinedResults.push({
            id: featureId,
            name: feature.name,
            description: feature.description,
            match_type: "keyword",
          });
          addedIds.add(featureId);
        }
      }

      // Add semantic matches that are not already in keyword matches
      for (const semanticFeature of semanticResults) {
        if (!addedIds.has(semanticFeature.id)) {
          combinedResults.push({
            id: semanticFeature.id,
            name: semanticFeature.name,
            description: semanticFeature.description,
            score: semanticFeature.score,
            match_type: "semantic",
          });
          addedIds.add(semanticFeature.id);
        }
      }

      return resultOrEmptyText(
        combinedResults,
        `No features found matching the query "${query}".`
      );
    }
  );
};
