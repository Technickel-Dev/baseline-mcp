const { Tool } = require("@modelcontextprotocol/sdk");
const { features, groups } = require("web-features");
const { tokenize, getTermFrequencies, cosineSimilarity } = require("../lib/text-processing.js").default;

// Pre-process all feature descriptions and names for faster lookup
const processedFeatures = {};
for (const featureId in features) {
  const feature = features[featureId];
  const combinedText = `${feature.name || ""} ${feature.description || ""}`;
  processedFeatures[featureId] = getTermFrequencies(tokenize(combinedText));
}

function findFeaturesInContent(content, fileType = null) {
  const foundFeatures = new Set();
  const lowerContent = content.toLowerCase();

  for (const featureId in features) {
    const feature = features[featureId];
    const name = (feature.name || "").toLowerCase();
    const description = (feature.description || "").toLowerCase();

    // Simple keyword matching for name and description
    if (name && lowerContent.includes(name)) {
      foundFeatures.add(featureId);
    }
    if (description && lowerContent.includes(description)) {
      foundFeatures.add(featureId);
    }

    // Match compat_features (MDN BCD keys)
    if (feature.compat_features) {
      for (const compatFeature of feature.compat_features) {
        if (lowerContent.includes(compatFeature.toLowerCase())) {
          foundFeatures.add(featureId);
        }
      }
    }

    // Match spec URLs (simplified: just check if URL is present)
    if (feature.spec) {
      for (const specUrl of feature.spec) {
        if (lowerContent.includes(specUrl.toLowerCase())) {
          foundFeatures.add(featureId);
        }
      }
    }

    // Basic HTML element matching
    if (fileType === "html" || fileType === null) {
      if (feature.group && feature.group.includes("html-elements")) {
        const tagName = featureId.replace(/element$/, ""); // e.g., 'a' from 'a-element'
        if (
          lowerContent.includes(`<${tagName}`)
          || lowerContent.includes(`</${tagName}>`)
        ) {
          foundFeatures.add(featureId);
        }
      }
    }

    // Basic CSS property matching
    if (fileType === "css" || fileType === null) {
      if (feature.group && feature.group.includes("css")) {
        // This is very basic and will need refinement for real-world use
        if (
          lowerContent.includes(name + ":")
          || lowerContent.includes(name + " ")
        ) {
          foundFeatures.add(featureId);
        }
      }
    }

    // Basic JavaScript API matching
    if (fileType === "javascript" || fileType === null) {
      if (feature.compat_features) {
        for (const compatFeature of feature.compat_features) {
          // Look for common API patterns like 'api.Window.fetch' -> 'window.fetch'
          const jsApiPattern = compatFeature
            .replace(/^api\./, "")
            .replace(/\./g, ".")
            .toLowerCase();
          if (lowerContent.includes(jsApiPattern)) {
            foundFeatures.add(featureId);
          }
        }
      }
    }
  }

  return Array.from(foundFeatures);
}

const featureSuggestionTool = new Tool("suggest_baseline_feature", {
  description:
    "Suggests a baseline web feature based on a query using both keyword matching and semantic similarity. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites. This tool helps you find the right feature for what you are trying to build.",
  run: async (query) => {
    const queryLower = query.toLowerCase();
    const queryTokens = tokenize(query);
    const queryTf = getTermFrequencies(queryTokens);

    const keywordResults = new Set();
    const semanticResults = [];

    for (const featureId in features) {
      const feature = features[featureId];
      const name = feature.name || "";
      const description = feature.description || "";

      // Keyword matching
      if (
        name.toLowerCase().includes(queryLower)
        || description.toLowerCase().includes(queryLower)
      ) {
        keywordResults.add(featureId);
      }

      // Semantic similarity (cosine similarity)
      const score = cosineSimilarity(queryTf, processedFeatures[featureId]);
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
        combinedResults.push({
          id: featureId,
          name: features[featureId].name,
          description: features[featureId].description,
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

    return combinedResults.slice(0, 10); // Return top 10 combined results
  },
});

const getFeatureDetailsTool = new Tool("get_feature_details", {
  description:
    "Gets all the details for a specific web feature, including its name, description, specification URL, and support status.",
  run: async (featureId) => {
    const feature = features[featureId];
    if (!feature) return `Feature with ID '${featureId}' not found.`;
    return feature;
  },
});

const getFeaturesByStatusTool = new Tool("get_features_by_status", {
  description:
    'Gets all web features with a specific baseline status. The status can be "high" (widely supported), "low" (newly supported), or false (not baseline). This helps in understanding the maturity of a feature.',
  run: async (status) => {
    const validStatuses = ["high", "low", false];
    if (!validStatuses.includes(status))
      return `Invalid status. Valid statuses are: high, low, false.`;
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (feature.status.baseline === status) {
        results.push({
          id: featureId,
          name: feature.name,
          status: feature.status,
        });
      }
    }
    return results;
  },
});

const getFeaturesByGroupTool = new Tool("get_features_by_group", {
  description:
    'Gets all web features in a specific group, such as "css" or "javascript". This is useful for exploring features within a certain technology.',
  run: async (groupName) => {
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (feature.group && feature.group.includes(groupName)) {
        results.push({ id: featureId, name: feature.name });
      }
    }
    return results;
  },
});

const getFeaturesByCaniuseIdTool = new Tool("get_features_by_caniuse_id", {
  description:
    "Gets a web-features feature by its corresponding caniuse.com feature ID. Caniuse.com is a popular website for checking browser support for web features.",
  run: async (caniuseId) => {
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (feature.caniuse && feature.caniuse.includes(caniuseId)) {
        results.push({ id: featureId, name: feature.name });
      }
    }
    return results;
  },
});

const getFeaturesWithSpecUrlTool = new Tool("get_features_with_spec_url", {
  description:
    "Gets all web features that reference a specific specification URL. This is useful for finding features defined in a particular web standard.",
  run: async (specUrl) => {
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (feature.spec && feature.spec.includes(specUrl)) {
        results.push({ id: featureId, name: feature.name });
      }
    }
    return results;
  },
});

const getFeaturesByCompatFeatureTool = new Tool(
  "get_features_by_compat_feature",
  {
    description:
      "Gets a web-features feature by its corresponding @mdn/browser-compat-data feature key. This data is used by the Mozilla Developer Network (MDN) to display browser compatibility tables.",
    run: async (compatFeature) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (
          feature.compat_features
          && feature.compat_features.includes(compatFeature)
        ) {
          results.push({ id: featureId, name: feature.name });
        }
      }
      return results;
    },
  }
);

const getBaselineHighSinceTool = new Tool("get_baseline_high_since", {
  description:
    'Gets all web features that reached "baseline high" status (widely supported) since a given date. This helps track the adoption of new features over time.',
  run: async (dateString) => {
    const sinceDate = new Date(dateString);
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (
        feature.status.baseline === "high"
        && new Date(feature.status.baseline_high_date) >= sinceDate
      ) {
        results.push({
          id: featureId,
          name: feature.name,
          baseline_high_date: feature.status.baseline_high_date,
        });
      }
    }
    return results;
  },
});

const getBaselineLowSinceTool = new Tool("get_baseline_low_since", {
  description:
    'Gets all web features that reached "baseline low" status (newly supported) since a given date. This helps track the emergence of new features.',
  run: async (dateString) => {
    const sinceDate = new Date(dateString);
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (
        feature.status.baseline === "low"
        && new Date(feature.status.baseline_low_date) >= sinceDate
      ) {
        results.push({
          id: featureId,
          name: feature.name,
          baseline_low_date: feature.status.baseline_low_date,
        });
      }
    }
    return results;
  },
});

const getBaselineLowLast30DaysTool = new Tool("get_baseline_low_last_30_days", {
    description: "Gets all web features that reached 'baseline low' status in the last 30 days.",
    run: async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.status.baseline === "low" && new Date(feature.status.baseline_low_date) >= thirtyDaysAgo) {
                results.push({
                    id: featureId,
                    name: feature.name,
                    baseline_low_date: feature.status.baseline_low_date,
                });
            }
        }
        return results;
    }
});

const getBaselineHighLast30DaysTool = new Tool("get_baseline_high_last_30_days", {
    description: "Gets all web features that reached 'baseline high' status in the last 30 days.",
    run: async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.status.baseline === "high" && new Date(feature.status.baseline_high_date) >= thirtyDaysAgo) {
                results.push({
                    id: featureId,
                    name: feature.name,
                    baseline_high_date: feature.status.baseline_high_date,
                });
            }
        }
        return results;
    }
});

const getBaselineStatusChangesLast30DaysTool = new Tool("get_baseline_status_changes_last_30_days", {
    description: "Lists all web features that have changed their baseline status in the last 30 days, showing the transition.",
    run: async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const results = [];

        for (const featureId in features) {
            const feature = features[featureId];

            // Check for newly high status
            if (feature.status.baseline === "high" && new Date(feature.status.baseline_high_date) >= thirtyDaysAgo) {
                results.push({
                    id: featureId,
                    name: feature.name,
                    transition: "Promoted to Widely Supported",
                    new_status: "high",
                    old_status: "low",
                    change_date: feature.status.baseline_high_date,
                });
            }

            // Check for newly low status
            if (feature.status.baseline === "low" && new Date(feature.status.baseline_low_date) >= thirtyDaysAgo) {
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
        return results.sort((a, b) => new Date(b.change_date) - new Date(a.change_date));
    }
});

const getFeaturesByDescriptionKeywordTool = new Tool(
  "get_features_by_description_keyword",
  {
    description:
      "Searches for a keyword only in the description of the web features. This allows for a more targeted search than the general suggest_baseline_feature tool.",
    run: async (keyword) => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        const description = feature.description || "";
        if (description.toLowerCase().includes(keyword.toLowerCase())) {
          results.push({ id: featureId, name: feature.name, description });
        }
      }
      return results;
    },
  }
);

const getFeaturesByNameKeywordTool = new Tool("get_features_by_name_keyword", {
  description:
    "Searches for a keyword only in the name of the web features. This allows for a more targeted search.",
  run: async (keyword) => {
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      const name = feature.name || "";
    if (name.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({ id: featureId, name: feature.name });
      }
    }
    return results;
  },
});

const getFeaturesWithMultipleSpecUrlsTool = new Tool(
  "get_features_with_multiple_spec_urls",
  {
    description:
      "Returns web features that have more than one specification URL. This can indicate that a feature is defined across multiple standards.",
    run: async () => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (feature.spec && feature.spec.length > 1) {
          results.push({
            id: featureId,
            name: feature.name,
            spec: feature.spec,
          });
        }
      }
      return results;
    },
  }
);

const getFeaturesWithNoSpecUrlTool = new Tool("get_features_with_no_spec_url", {
  description:
    "Returns web features that have no specification URL. This may indicate that a feature is non-standard or proprietary.",
  run: async () => {
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (!feature.spec || feature.spec.length === 0) {
        results.push({ id: featureId, name: feature.name });
      }
    }
    return results;
  },
});

const getFeaturesWithCaniuseMappingTool = new Tool(
  "get_features_with_caniuse_mapping",
  {
    description:
      "Returns all web features that have a mapping to a caniuse.com feature ID.",
    run: async () => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (feature.caniuse) {
          results.push({
            id: featureId,
            name: feature.name,
            caniuse: feature.caniuse,
          });
        }
      }
      return results;
    },
  }
);

const getFeaturesWithCompatFeaturesMappingTool = new Tool(
  "get_features_with_compat_features_mapping",
  {
    description:
      "Returns all web features that have a mapping to a @mdn/browser-compat-data feature key.",
    run: async () => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (feature.compat_features) {
          results.push({
            id: featureId,
            name: feature.name,
            compat_features: feature.compat_features,
          });
        }
      }
      return results;
    },
  }
);

const getFeaturesWithAlternativesTool = new Tool(
  "get_features_with_alternatives",
  {
    description:
      "Returns all discouraged web features that have recommended alternatives.",
    run: async () => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (feature.discouraged && feature.discouraged.alternatives) {
          results.push({
            id: featureId,
            name: feature.name,
            alternatives: feature.discouraged.alternatives,
          });
        }
      }
      return results;
    },
  }
);

const getFeatureAlternativeTool = new Tool("get_feature_alternative", {
  description:
    "Gets the recommended alternatives for a discouraged web feature.",
  run: async (featureId) => {
    const feature = features[featureId];
    if (!feature || !feature.discouraged)
      return `Feature '${featureId}' not found or is not discouraged.`;
    return feature.discouraged.alternatives;
  },
});

const getRandomFeatureTool = new Tool("get_random_feature", {
  description: "Returns a random web feature. Useful for discovery.",
  run: async () => {
    const featureIds = Object.keys(features);
    const randomId = featureIds[Math.floor(Math.random() * featureIds.length)];
    return features[randomId];
  },
});

const getFeaturesWithHtmlDescriptionTool = new Tool(
  "get_features_with_html_description",
  {
    description:
      "Returns web features that have an HTML-formatted description.",
    run: async () => {
      const results = [];
      for (const featureId in features) {
        const feature = features[featureId];
        if (feature.description_html) {
          results.push({
            id: featureId,
            name: feature.name,
            description_html: feature.description_html,
          });
        }
      }
      return results;
    },
  }
);

const listFeaturesInFileTool = new Tool("list_features_in_file", {
  description:
    "Analyzes the provided file content and lists the baseline web features used within it. This tool performs a simplified analysis based on keywords, HTML tags, CSS properties, and JavaScript API calls. It is not a full-fledged parser and may not identify all features or may produce false positives.",
  run: async (fileContent, fileType = null) => {
    return findFeaturesInContent(fileContent, fileType);
  },
});

const getMigrationPathForDiscouragedFeatureTool = new Tool(
  "get_migration_path_for_discouraged_feature",
  {
    description:
      "Suggests a step-by-step migration path or a list of recommended replacement features for a discouraged web feature, possibly with links to documentation.",
    run: async (featureId) => {
      const feature = features[featureId];
      if (!feature || !feature.discouraged)
        return `Feature '${featureId}' not found or is not discouraged.`;

      let migrationPath = `To migrate from '${feature.name}':\n\n`;

      if (
        feature.discouraged.alternatives
        && feature.discouraged.alternatives.length > 0
      ) {
        migrationPath += "Recommended alternatives:\n";
        for (const alt of feature.discouraged.alternatives) {
          migrationPath += `- ${alt}\n`;
        }
      }

      if (
        feature.discouraged.according_to
        && feature.discouraged.according_to.length > 0
      ) {
        migrationPath +=
          "\nFurther reading (official discouragement notices):\n";
        for (const link of feature.discouraged.according_to) {
          migrationPath += `- ${link}\n`;
        }
      }

      // Hypothetical: Add more detailed migration steps if such data were available
      migrationPath +=
        "\n(Note: Detailed step-by-step migration guides are not available in the current dataset, but you can refer to the provided alternatives and official notices for more information.)";

      return migrationPath;
    },
  }
);

const getGroupDescriptionTool = new Tool("get_group_description", {
  description: "Gets the description of a feature group.",
  run: async (groupName) => {
    const group = groups[groupName];
    if (!group) return `Group '${groupName}' not found.`;
    return group.description;
  },
});

const getMinBrowserSupportForFileTool = new Tool("get_min_browser_support_for_file", {
    description: "Analyzes file content to determine the minimum browser version required to support all detected web features.",
    run: async (fileContent, fileType = null) => {
        const detectedFeatures = findFeaturesInContent(fileContent, fileType);
        if (detectedFeatures.length === 0) {
            return "No web features detected in the file.";
        }

        const minVersions = {};

        for (const featureId of detectedFeatures) {
            const feature = features[featureId];
            if (!feature || !feature.status || !feature.status.support) continue;

            for (const browser in feature.status.support) {
                const requiredVersion = parseFloat(feature.status.support[browser]);
                if (isNaN(requiredVersion)) continue;

                if (!minVersions[browser] || requiredVersion > parseFloat(minVersions[browser] || "0")) {
                    minVersions[browser] = feature.status.support[browser];
                }
            }
        }
        return minVersions;
    }
});

module.exports = {
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
};
