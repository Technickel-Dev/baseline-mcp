import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { browsers, features } from "web-features";
import { z } from "zod";
import { resultOrEmptyText } from "../lib/mcp.js";
import { findFeaturesInContent } from "../lib/feature.js";

export const registerBrowserTools = (server: McpServer) => {
  server.registerTool(
    "get_latest_browser_versions",
    {
      description:
        "Returns the latest version of each major browser. This is useful for knowing the most up-to-date browser versions.",
    },
    async () => {
      const latestVersions: { [key: string]: string } = {};
      for (const browserName of Object.keys(browsers) as Array<
        keyof typeof browsers
      >) {
        const browser = browsers[browserName];
        latestVersions[browserName] =
          browser.releases[browser.releases.length - 1].version;
      }
      return {
        content: [{ type: "text", text: JSON.stringify(latestVersions) }],
      };
    }
  );

  server.registerTool(
    "check_feature_support",
    {
      description:
        "Checks in which version a browser started supporting a specific web feature. This is useful for determining browser compatibility.",
      inputSchema: {
        featureId: z
          .string()
          .describe("The ID of the web feature to check (e.g., 'webgl')."),
        browserName: z
          .string()
          .describe(
            "The name of the browser to check (e.g., 'chrome', 'firefox')."
          ),
      },
    },
    async ({ featureId, browserName }) => {
      const feature = features[featureId];
      let message: string;
      if (!feature) {
        message = `Feature with ID '${featureId}' not found.`;
      } else if (
        "status" in feature &&
        feature.status &&
        feature.status.support
      ) {
        const support =
          feature.status.support[
            browserName as keyof typeof feature.status.support
          ];
        if (!support) {
          message = `Browser '${browserName}' not found or no support information available.`;
        } else {
          message = `Feature '${featureId}' is supported in ${browserName} since version ${support}.`;
        }
      } else {
        message = `Feature '${featureId}' does not have status/support information.`;
      }
      return {
        content: [{ type: "text", text: message }],
      };
    }
  );

  server.registerTool(
    "get_unsupported_features",
    {
      description:
        "Returns a list of web features not supported by a given browser. This is useful for identifying potential compatibility issues.",
      inputSchema: {
        browserName: z
          .string()
          .describe(
            "The name of the browser to check (e.g., 'chrome', 'firefox')."
          ),
      },
    },
    async ({ browserName }) => {
      const results: Array<{ id: string; name: string }> = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status &&
          feature.status.support &&
          !feature.status.support[
            browserName as keyof typeof feature.status.support
          ]
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }
      return resultOrEmptyText(
        results,
        `All features are supported by ${browserName}.`
      );
    }
  );

  server.registerTool(
    "get_recently_supported_features",
    {
      description:
        "Returns a list of web features that were newly supported in a given browser version. This helps in understanding the evolution of a browser's capabilities.",
      inputSchema: {
        browserName: z
          .string()
          .describe(
            "The name of the browser to check (e.g., 'chrome', 'firefox')."
          ),
        version: z
          .string()
          .describe(
            "The version of the browser to check for new feature support (e.g., '89.0')."
          ),
      },
    },
    async ({ browserName, version }) => {
      const results: Array<{ id: string; name: string }> = [];
      for (const featureId in features) {
        const feature = features[featureId as keyof typeof features];
        if (
          "status" in feature &&
          feature.status &&
          feature.status.support &&
          feature.status.support[
            browserName as keyof typeof feature.status.support
          ] === version
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }

      return resultOrEmptyText(
        results,
        `No features were newly supported in ${browserName} version ${version}.`
      );
    }
  );

  server.registerTool(
    "compare_browser_support",
    {
      description:
        "Compares browser support for two or more web features. This is useful for making informed decisions about which features to use.",
      inputSchema: {
        featureIds: z
          .array(z.string())
          .describe(
            "An array of web feature IDs to compare (e.g., ['webgl', 'canvas'])."
          ),
      },
    },
    async ({ featureIds }) => {
      const results: { [key: string]: any } = {};
      for (const featureId of featureIds) {
        const feature = features[featureId as keyof typeof features];
        if (feature && "status" in feature && feature.status.support) {
          results[featureId] = feature.status.support;
        } else {
          results[featureId] =
            "Feature not found or no support information available.";
        }
      }
      return resultOrEmptyText(
        Object.entries(results).map(([id, support]) => ({ id, support })),
        "No valid features found for comparison."
      );
    }
  );

  server.registerTool(
    "get_browser_release_dates",
    {
      description:
        "Returns a list of release dates and versions for a given browser. This provides historical data about a browser's development.",
      inputSchema: {
        browserName: z
          .string()
          .describe(
            "The name of the browser to check (e.g., 'chrome', 'firefox')."
          ),
      },
    },
    async ({ browserName }) => {
      const browser = browsers[browserName as keyof typeof browsers];
      if (!browser) {
        return {
          content: [
            {
              type: "text",
              text: `Browser '${browserName}' not found.`,
            },
          ],
        };
      }
      return resultOrEmptyText(
        browser.releases,
        `No release data found for browser '${browserName}'.`
      );
    }
  );

  server.registerTool(
    "get_browser_release_date",
    {
      description:
        "Returns the release date for a specific browser version. This helps in understanding when a particular browser version was released.",
      inputSchema: {
        browserName: z
          .string()
          .describe(
            "The name of the browser to check (e.g., 'chrome', 'firefox')."
          ),
        version: z
          .string()
          .describe("The version of the browser to check (e.g., '89.0')."),
      },
    },
    async ({ browserName, version }) => {
      const browser = browsers[browserName as keyof typeof browsers];
      if (!browser) {
        return {
          content: [
            {
              type: "text",
              text: `Browser '${browserName}' not found.`,
            },
          ],
        };
      }
      const release = browser.releases.find((r) => r.version === version);
      if (!release) {
        return {
          content: [
            {
              type: "text",
              text: `Version '${version}' not found for browser '${browserName}'.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Browser '${browserName}' version '${version}' was released on ${release.date}.`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_features_not_supported_by_any_browser",
    {
      description:
        "Returns web features not supported by any major browser. These features are likely experimental or obsolete.",
    },
    async () => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (!("status" in feature)) {
          continue;
        }

        const supportedByAny = Object.keys(feature.status.support).length > 0;
        if (!supportedByAny) {
          results.push({ id: featureId, name: feature.name });
        }
      }
      return resultOrEmptyText(
        results,
        "All features are supported by at least one major browser."
      );
    }
  );

  server.registerTool(
    "generate_browser_support_matrix",
    {
      description:
        "Generates a simplified browser support matrix for a given list of web features across major browsers.",
      inputSchema: {
        featureIds: z
          .array(z.string())
          .describe(
            "An array of web feature IDs to include in the matrix (e.g., ['webgl', 'canvas'])."
          ),
      },
    },
    async ({ featureIds }) => {
      const majorBrowsers = ["chrome", "edge", "firefox", "safari"];
      const matrix = {
        headers: ["Feature", ...majorBrowsers],
        rows: [] as Array<Array<string>>,
      };

      for (const featureId of featureIds) {
        const feature = features[featureId];
        if (feature) {
          if (!("status" in feature) || !feature.status.support) {
            continue;
          }

          const identifier = feature.name || featureId;
          const row = [identifier];
          for (const browser of majorBrowsers as Array<
            keyof typeof feature.status.support
          >) {
            row.push(feature.status.support[browser] || "-");
          }
          matrix.rows.push(row);
        }
      }

      if (matrix.rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No valid features found to generate the support matrix.",
            },
          ],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(matrix) }],
      };
    }
  );

  server.registerTool(
    "get_min_browser_support_for_file",
    {
      description:
        "Analyzes file content to determine the minimum browser version required to support all detected web features.",
      inputSchema: {
        fileContent: z.string().describe("The content of the file to analyze."),
        fileType: z
          .string()
          .optional()
          .describe(
            "The type of the file (e.g., 'html', 'css', 'js'). If not provided, a general analysis will be performed."
          ),
      },
    },
    async ({ fileContent, fileType }) => {
      const detectedFeatures = findFeaturesInContent(fileContent, fileType);
      if (Object.keys(detectedFeatures).length === 0) {
        return {
          content: [
            { type: "text", text: "No web features detected in the file." },
          ],
        };
      }
      const minVersions: { [key: string]: string } = {};

      for (const featureId in detectedFeatures) {
        const feature = features[featureId];
        if (!feature || !("status" in feature) || !feature.status.support) {
          continue;
        }

        for (const browser of Object.keys(feature.status.support) as Array<
          keyof typeof feature.status.support
        >) {
          const requiredVersion = parseFloat(feature.status.support[browser]!);
          if (isNaN(requiredVersion)) {
            continue;
          }

          if (
            !minVersions[browser] ||
            requiredVersion > parseFloat(minVersions[browser] || "0")
          ) {
            minVersions[browser] = feature.status.support[browser] || "";
          }
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              detectedFeatures,
              minBrowserVersions: minVersions,
            }),
          },
        ],
      };
    }
  );
};
