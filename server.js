import { McpServer, StdioTransport } from "@modelcontextprotocol/sdk";
import {
  featureSuggestionTool,
  getFeatureDetailsTool,
  getFeaturesByStatusTool,
  getFeaturesByGroupTool,
  getFeaturesByCaniuseIdTool,
  getFeaturesWithSpecUrlTool,
  getFeaturesByCompatFeatureTool,
  getBaselineHighSinceTool,
  getBaselineLowSinceTool,
  getBaselineLowLast30DaysTool,
  getBaselineHighLast30DaysTool,
  getBaselineStatusChangesLast30DaysTool,
  getMinBrowserSupportForFileTool,
  getFeaturesByDescriptionKeywordTool,
  getFeaturesByNameKeywordTool,
  getFeaturesWithMultipleSpecUrlsTool,
  getFeaturesWithNoSpecUrlTool,
  getFeaturesWithCaniuseMappingTool,
  getFeaturesWithCompatFeaturesMappingTool,
  getFeaturesWithAlternativesTool,
  getFeatureAlternativeTool,
  getRandomFeatureTool,
  getFeaturesWithHtmlDescriptionTool,
  listFeaturesInFileTool,
  getMigrationPathForDiscouragedFeatureTool,
  getGroupDescriptionTool,
} from "./tools/feature.js";
import {
  checkFeatureSupportTool,
  getUnsupportedFeaturesTool,
  getRecentlySupportedFeaturesTool,
  compareFeatureSupportTool,
  getBrowserReleaseDatesTool,
  getBrowserReleaseDateTool,
  getFeaturesSupportedByAllBrowsersTool,
  getFeaturesSupportedByAnyBrowserTool,
  getFeaturesNotSupportedByAnyBrowserTool,
  generateBrowserSupportMatrixTool,
} from "./tools/browser.js";
import {
  getFeaturesInSnapshotTool,
  getSnapshotDescriptionTool,
} from "./tools/utility.js";
import { baselineFeaturesList, discouragedFeaturesResource } from "./resources/features.js";
import { snapshotsResource } from "./resources/snapshots.js";
import { latestBrowserVersionsResource } from "./resources/browsers.js";
import { featureGroupsResource } from "./resources/groups.js";

// --- Server Setup ---

const server = new McpServer("baseline-feature-suggester", {
  description: "A server for querying baseline web features data.",
  tools: [
    featureSuggestionTool,
    checkFeatureSupportTool,
    getFeatureDetailsTool,
    getFeaturesByStatusTool,
    getFeaturesByGroupTool,
    getFeaturesByCaniuseIdTool,
    getFeaturesWithSpecUrlTool,
    getFeaturesByCompatFeatureTool,
    getBaselineHighSinceTool,
    getBaselineLowSinceTool,
    getBaselineLowLast30DaysTool,
    getBaselineHighLast30DaysTool,
    getBaselineStatusChangesLast30DaysTool,
    getMinBrowserSupportForFileTool,
    getUnsupportedFeaturesTool,
    getRecentlySupportedFeaturesTool,
    compareFeatureSupportTool,
    getBrowserReleaseDatesTool,
    getFeaturesInSnapshotTool,
    getBrowserReleaseDateTool,
    getFeaturesByDescriptionKeywordTool,
    getFeaturesByNameKeywordTool,
    getFeaturesWithMultipleSpecUrlsTool,
    getFeaturesWithNoSpecUrlTool,
    getFeaturesWithCaniuseMappingTool,
    getFeaturesWithCompatFeaturesMappingTool,
    getFeaturesSupportedByAllBrowsersTool,
    getFeaturesSupportedByAnyBrowserTool,
    getFeaturesNotSupportedByAnyBrowserTool,
    getGroupDescriptionTool,
    getSnapshotDescriptionTool,
    getFeaturesWithAlternativesTool,
    getFeatureAlternativeTool,
    getRandomFeatureTool,
    getFeaturesWithHtmlDescriptionTool,
    listFeaturesInFileTool,
    getMigrationPathForDiscouragedFeatureTool,
    generateBrowserSupportMatrixTool,
  ],
  resources: [baselineFeaturesList, snapshotsResource, latestBrowserVersionsResource, featureGroupsResource, discouragedFeaturesResource],
});

server.runWith(new StdioTransport());
