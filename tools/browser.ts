import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { browsers, features } from "web-features";
import { z } from "zod";

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
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      };
    }
  );

  // const getRecentlySupportedFeaturesTool = new Tool(
  //   "get_recently_supported_features",
  //   {
  //     description:
  //       "Returns a list of web features that were newly supported in a given browser version. This helps in understanding the evolution of a browser's capabilities.",
  //     run: async (browserName, version) => {
  //       const results = [];
  //       for (const featureId in features) {
  //         const feature = features[featureId];
  //         if (feature.status.support[browserName] === version) {
  //           results.push({ id: featureId, name: feature.name });
  //         }
  //       }
  //       return results;
  //     },
  //   }
  // );

  // const compareFeatureSupportTool = new Tool("compare_feature_support", {
  //   description:
  //     "Compares browser support for two or more web features. This is useful for making informed decisions about which features to use.",
  //   run: async (...featureIds) => {
  //     const results = {};
  //     for (const featureId of featureIds) {
  //       const feature = features[featureId];
  //       if (feature) {
  //         results[featureId] = feature.status.support;
  //       }
  //     }
  //     return results;
  //   },
  // });

  // const getBrowserReleaseDatesTool = new Tool("get_browser_release_dates", {
  //   description:
  //     "Returns a list of release dates and versions for a given browser. This provides historical data about a browser's development.",
  //   run: async (browserName) => {
  //     const browser = browsers[browserName];
  //     if (!browser) return `Browser '${browserName}' not found.`;
  //     return browser.releases;
  //   },
  // });

  // const getBrowserReleaseDateTool = new Tool("get_browser_release_date", {
  //   description:
  //     "Returns the release date for a specific browser version. This helps in understanding when a particular browser version was released.",
  //   run: async (browserName, version) => {
  //     const browser = browsers[browserName];
  //     if (!browser) return `Browser '${browserName}' not found.`;
  //     const release = browser.releases.find((r) => r.version === version);
  //     if (!release)
  //       return `Version '${version}' not found for browser '${browserName}'.`;
  //     return release.date;
  //   },
  // });

  // const getFeaturesSupportedByAllBrowsersTool = new Tool(
  //   "get_features_supported_by_all_browsers",
  //   {
  //     description:
  //       "Returns web features supported by all major browsers (chrome, edge, firefox, safari). These are the most reliable features to use.",
  //     run: async () => {
  //       const results = [];
  //       const majorBrowsers = ["chrome", "edge", "firefox", "safari"];
  //       for (const featureId in features) {
  //         const feature = features[featureId];
  //         const supportedByAll = majorBrowsers.every(
  //           (browser) => feature.status.support[browser]
  //         );
  //         if (supportedByAll) {
  //           results.push({ id: featureId, name: feature.name });
  //         }
  //       }
  //       return results;
  //     },
  //   }
  // );

  // const getFeaturesSupportedByAnyBrowserTool = new Tool(
  //   "get_features_supported_by_any_browser",
  //   {
  //     description:
  //       "Returns web features supported by at least one major browser.",
  //     run: async () => {
  //       const results = [];
  //       for (const featureId in features) {
  //         const feature = features[featureId];
  //         const supportedByAny = Object.keys(feature.status.support).length > 0;
  //         if (supportedByAny) {
  //           results.push({ id: featureId, name: feature.name });
  //         }
  //       }
  //       return results;
  //     },
  //   }
  // );

  // const getFeaturesNotSupportedByAnyBrowserTool = new Tool(
  //   "get_features_not_supported_by_any_browser",
  //   {
  //     description:
  //       "Returns web features not supported by any major browser. These features are likely experimental or obsolete.",
  //     run: async () => {
  //       const results = [];
  //       for (const featureId in features) {
  //         const feature = features[featureId];
  //         const supportedByAny = Object.keys(feature.status.support).length > 0;
  //         if (!supportedByAny) {
  //           results.push({ id: featureId, name: feature.name });
  //         }
  //       }
  //       return results;
  //     },
  //   }
  // );

  // const generateBrowserSupportMatrixTool = new Tool(
  //   "generate_browser_support_matrix",
  //   {
  //     description:
  //       "Generates a simplified browser support matrix for a given list of web features across major browsers.",
  //     run: async (...featureIds) => {
  //       const majorBrowsers = ["chrome", "edge", "firefox", "safari"];
  //       const matrix = {};

  //       // Header row
  //       matrix.headers = ["Feature", ...majorBrowsers];

  //       // Data rows
  //       matrix.rows = [];
  //       for (const featureId of featureIds) {
  //         const feature = features[featureId];
  //         if (feature) {
  //           const row = [feature.name || feature.id];
  //           for (const browser of majorBrowsers) {
  //             row.push(feature.status.support[browser] || "-");
  //           }
  //           matrix.rows.push(row);
  //         }
  //       }
  //       return matrix;
  //     },
  //   }
  // );
};
