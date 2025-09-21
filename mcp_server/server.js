const { McpServer, Tool, Resource, StdioTransport } = require('@modelcontextprotocol/sdk');
const { features, groups, browsers, snapshots } = require('web-features');

// --- Helper functions for text processing and similarity ---

// Simple stop words list (can be expanded)
const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
]);

function tokenize(text) {
    return text.toLowerCase()
               .replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, '') // Remove punctuation
               .split(/\s+/)
               .filter(word => word.length > 0 && !stopWords.has(word));
}

function getTermFrequencies(tokens) {
    const tf = {};
    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }
    return tf;
}

function dotProduct(vec1, vec2) {
    let product = 0;
    for (const key in vec1) {
        if (vec2[key]) {
            product += vec1[key] * vec2[key];
        }
    }
    return product;
}

function magnitude(vec) {
    let sum = 0;
    for (const key in vec) {
        sum += vec[key] * vec[key];
    }
    return Math.sqrt(sum);
}

function cosineSimilarity(vec1, vec2) {
    const num = dotProduct(vec1, vec2);
    const den = magnitude(vec1) * magnitude(vec2);
    if (den === 0) return 0;
    return num / den;
}

// Pre-process all feature descriptions and names for faster lookup
const processedFeatures = {};
for (const featureId in features) {
    const feature = features[featureId];
    const combinedText = `${feature.name || ''} ${feature.description || ''}`;
    processedFeatures[featureId] = getTermFrequencies(tokenize(combinedText));
}

// --- Helper function for feature matching ---
function findFeaturesInContent(content, fileType = null) {
    const foundFeatures = new Set();
    const lowerContent = content.toLowerCase();

    for (const featureId in features) {
        const feature = features[featureId];
        const name = (feature.name || '').toLowerCase();
        const description = (feature.description || '').toLowerCase();

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
        if (fileType === 'html' || fileType === null) {
            if (feature.group && feature.group.includes('html-elements')) {
                const tagName = featureId.replace(/element$/, ''); // e.g., 'a' from 'a-element'
                if (lowerContent.includes(`<${tagName}`) || lowerContent.includes(`</${tagName}>`)) {
                    foundFeatures.add(featureId);
                }
            }
        }

        // Basic CSS property matching
        if (fileType === 'css' || fileType === null) {
            if (feature.group && feature.group.includes('css')) {
                // This is very basic and will need refinement for real-world use
                if (lowerContent.includes(name + ':') || lowerContent.includes(name + ' ')) {
                    foundFeatures.add(featureId);
                }
            }
        }

        // Basic JavaScript API matching
        if (fileType === 'javascript' || fileType === null) {
            if (feature.compat_features) {
                for (const compatFeature of feature.compat_features) {
                    // Look for common API patterns like 'api.Window.fetch' -> 'window.fetch'
                    const jsApiPattern = compatFeature.replace(/^api\./, '').replace(/\./g, '\.').toLowerCase();
                    if (lowerContent.includes(jsApiPattern)) {
                        foundFeatures.add(featureId);
                    }
                }
            }
        }
    }

    return Array.from(foundFeatures);
}

// --- Tool Definitions ---

const featureSuggestionTool = new Tool('suggest_baseline_feature', {
  description: 'Suggests a baseline web feature based on a query using both keyword matching and semantic similarity. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites. This tool helps you find the right feature for what you are trying to build.',
  run: async (query) => {
    const queryLower = query.toLowerCase();
    const queryTokens = tokenize(query);
    const queryTf = getTermFrequencies(queryTokens);

    const keywordResults = new Set();
    const semanticResults = [];

    for (const featureId in features) {
        const feature = features[featureId];
        const name = feature.name || '';
        const description = feature.description || '';

        // Keyword matching
        if (name.toLowerCase().includes(queryLower) || description.toLowerCase().includes(queryLower)) {
            keywordResults.add(featureId);
        }

        // Semantic similarity (cosine similarity)
        const score = cosineSimilarity(queryTf, processedFeatures[featureId]);
        if (score > 0) {
            semanticResults.push({
                id: featureId,
                name: name,
                description: description,
                score: score
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
                match_type: 'keyword'
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
                match_type: 'semantic'
            });
            addedIds.add(semanticFeature.id);
        }
    }

    return combinedResults.slice(0, 10); // Return top 10 combined results
  }
});

const checkFeatureSupportTool = new Tool('check_feature_support', {
    description: 'Checks in which version a browser started supporting a specific web feature. This is useful for determining browser compatibility.',
    run: async (featureId, browserName) => {
        const feature = features[featureId];
        if (!feature) return `Feature with ID '${featureId}' not found.`;
        const support = feature.status.support[browserName];
        if (!support) return `Browser '${browserName}' not found or no support information available.`;
        return `Feature '${featureId}' is supported in ${browserName} since version ${support}.`;
    }
});

const getFeatureDetailsTool = new Tool('get_feature_details', {
    description: 'Gets all the details for a specific web feature, including its name, description, specification URL, and support status.',
    run: async (featureId) => {
        const feature = features[featureId];
        if (!feature) return `Feature with ID '${featureId}' not found.`;
        return feature;
    }
});

const getFeaturesByStatusTool = new Tool('get_features_by_status', {
    description: 'Gets all web features with a specific baseline status. The status can be \"high\" (widely supported), \"low\" (newly supported), or false (not baseline). This helps in understanding the maturity of a feature.',
    run: async (status) => {
        const validStatuses = ["high", "low", false];
        if (!validStatuses.includes(status)) return `Invalid status. Valid statuses are: high, low, false.`;
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.status.baseline === status) {
                results.push({ id: featureId, name: feature.name, status: feature.status });
            }
        }
        return results;
    }
});

const getFeaturesByGroupTool = new Tool('get_features_by_group', {
    description: 'Gets all web features in a specific group, such as \"css\" or \"javascript\". This is useful for exploring features within a certain technology.',
    run: async (groupName) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.group && feature.group.includes(groupName)) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getDiscouragedFeaturesTool = new Tool('get_discouraged_features', {
    description: 'Returns a list of all web features that are discouraged from use. This is important for avoiding obsolete or problematic features.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.discouraged) {
                results.push({ id: featureId, name: feature.name, discouraged: feature.discouraged });
            }
        }
        return results;
    }
});

const getFeaturesByCaniuseIdTool = new Tool('get_features_by_caniuse_id', {
    description: 'Gets a web-features feature by its corresponding caniuse.com feature ID. Caniuse.com is a popular website for checking browser support for web features.',
    run: async (caniuseId) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.caniuse && feature.caniuse.includes(caniuseId)) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getFeaturesWithSpecUrlTool = new Tool('get_features_with_spec_url', {
    description: 'Gets all web features that reference a specific specification URL. This is useful for finding features defined in a particular web standard.',
    run: async (specUrl) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.spec && feature.spec.includes(specUrl)) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getFeaturesByCompatFeatureTool = new Tool('get_features_by_compat_feature', {
    description: 'Gets a web-features feature by its corresponding @mdn/browser-compat-data feature key. This data is used by the Mozilla Developer Network (MDN) to display browser compatibility tables.',
    run: async (compatFeature) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.compat_features && feature.compat_features.includes(compatFeature)) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getBaselineHighSinceTool = new Tool('get_baseline_high_since', {
    description: 'Gets all web features that reached \"baseline high\" status (widely supported) since a given date. This helps track the adoption of new features over time.',
    run: async (dateString) => {
        const sinceDate = new Date(dateString);
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.status.baseline === 'high' && new Date(feature.status.baseline_high_date) >= sinceDate) {
                results.push({ id: featureId, name: feature.name, baseline_high_date: feature.status.baseline_high_date });
            }
        }
        return results;
    }
});

const getBaselineLowSinceTool = new Tool('get_baseline_low_since', {
    description: 'Gets all web features that reached \"baseline low\" status (newly supported) since a given date. This helps track the emergence of new features.',
    run: async (dateString) => {
        const sinceDate = new Date(dateString);
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.status.baseline === 'low' && new Date(feature.status.baseline_low_date) >= sinceDate) {
                results.push({ id: featureId, name: feature.name, baseline_low_date: feature.status.baseline_low_date });
            }
        }
        return results;
    }
});

const getFeatureGroupsTool = new Tool('get_feature_groups', {
    description: 'Returns a list of all available feature groups. These groups categorize features by technology (e.g., \"css\", \"javascript\").',
    run: async () => {
        return Object.keys(groups);
    }
});

const getUnsupportedFeaturesTool = new Tool('get_unsupported_features', {
    description: 'Returns a list of web features not supported by a given browser. This is useful for identifying potential compatibility issues.',
    run: async (browserName) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (!feature.status.support[browserName]) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getRecentlySupportedFeaturesTool = new Tool('get_recently_supported_features', {
    description: 'Returns a list of web features that were newly supported in a given browser version. This helps in understanding the evolution of a browser\'s capabilities.',
    run: async (browserName, version) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.status.support[browserName] === version) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const compareFeatureSupportTool = new Tool('compare_feature_support', {
    description: 'Compares browser support for two or more web features. This is useful for making informed decisions about which features to use.',
    run: async (...featureIds) => {
        const results = {};
        for (const featureId of featureIds) {
            const feature = features[featureId];
            if (feature) {
                results[featureId] = feature.status.support;
            }
        }
        return results;
    }
});

const getBrowserReleaseDatesTool = new Tool('get_browser_release_dates', {
    description: 'Returns a list of release dates and versions for a given browser. This provides historical data about a browser\'s development.',
    run: async (browserName) => {
        const browser = browsers[browserName];
        if (!browser) return `Browser '${browserName}' not found.`;
        return browser.releases;
    }
});

const getSnapshotsTool = new Tool('get_snapshots', {
    description: 'Returns a list of all available snapshots. Snapshots are collections of features that represent a specific version of a technology, such as \"ecmascript-2022\".',
    run: async () => {
        return Object.keys(snapshots);
    }
});

const getFeaturesInSnapshotTool = new Tool('get_features_in_snapshot', {
    description: 'Gets all web features in a given snapshot. This is useful for understanding the feature set of a specific technology version.',
    run: async (snapshotName) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.snapshot && feature.snapshot.includes(snapshotName)) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getLatestBrowserVersionsTool = new Tool('get_latest_browser_versions', {
    description: 'Returns the latest version of each major browser. This is useful for knowing the most up-to-date browser versions.',
    run: async () => {
        const latestVersions = {};
        for (const browserName in browsers) {
            const browser = browsers[browserName];
            latestVersions[browserName] = browser.releases[browser.releases.length - 1].version;
        }
        return latestVersions;
    }
});

const getBrowserReleaseDateTool = new Tool('get_browser_release_date', {
    description: 'Returns the release date for a specific browser version. This helps in understanding when a particular browser version was released.',
    run: async (browserName, version) => {
        const browser = browsers[browserName];
        if (!browser) return `Browser '${browserName}' not found.`;
        const release = browser.releases.find(r => r.version === version);
        if (!release) return `Version '${version}' not found for browser '${browserName}'.`;
        return release.date;
    }
});

const getFeaturesByDescriptionKeywordTool = new Tool('get_features_by_description_keyword', {
    description: 'Searches for a keyword only in the description of the web features. This allows for a more targeted search than the general suggest_baseline_feature tool.',
    run: async (keyword) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            const description = feature.description || '';
            if (description.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({ id: featureId, name: feature.name, description });
            }
        }
        return results;
    }
});

const getFeaturesByNameKeywordTool = new Tool('get_features_by_name_keyword', {
    description: 'Searches for a keyword only in the name of the web features. This allows for a more targeted search.',
    run: async (keyword) => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            const name = feature.name || '';
            if (name.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getFeaturesWithMultipleSpecUrlsTool = new Tool('get_features_with_multiple_spec_urls', {
    description: 'Returns web features that have more than one specification URL. This can indicate that a feature is defined across multiple standards.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.spec && feature.spec.length > 1) {
                results.push({ id: featureId, name: feature.name, spec: feature.spec });
            }
        }
        return results;
    }
});

const getFeaturesWithNoSpecUrlTool = new Tool('get_features_with_no_spec_url', {
    description: 'Returns web features that have no specification URL. This may indicate that a feature is non-standard or proprietary.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (!feature.spec || feature.spec.length === 0) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getFeaturesWithCaniuseMappingTool = new Tool('get_features_with_caniuse_mapping', {
    description: 'Returns all web features that have a mapping to a caniuse.com feature ID.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.caniuse) {
                results.push({ id: featureId, name: feature.name, caniuse: feature.caniuse });
            }
        }
        return results;
    }
});

const getFeaturesWithCompatFeaturesMappingTool = new Tool('get_features_with_compat_features_mapping', {
    description: 'Returns all web features that have a mapping to a @mdn/browser-compat-data feature key.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.compat_features) {
                results.push({ id: featureId, name: feature.name, compat_features: feature.compat_features });
            }
        }
        return results;
    }
});

const getFeaturesSupportedByAllBrowsersTool = new Tool('get_features_supported_by_all_browsers', {
    description: 'Returns web features supported by all major browsers (chrome, edge, firefox, safari). These are the most reliable features to use.',
    run: async () => {
        const results = [];
        const majorBrowsers = ['chrome', 'edge', 'firefox', 'safari'];
        for (const featureId in features) {
            const feature = features[featureId];
            const supportedByAll = majorBrowsers.every(browser => feature.status.support[browser]);
            if (supportedByAll) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getFeaturesSupportedByAnyBrowserTool = new Tool('get_features_supported_by_any_browser', {
    description: 'Returns web features supported by at least one major browser.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            const supportedByAny = Object.keys(feature.status.support).length > 0;
            if (supportedByAny) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getFeaturesNotSupportedByAnyBrowserTool = new Tool('get_features_not_supported_by_any_browser', {
    description: 'Returns web features not supported by any major browser. These features are likely experimental or obsolete.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            const supportedByAny = Object.keys(feature.status.support).length > 0;
            if (!supportedByAny) {
                results.push({ id: featureId, name: feature.name });
            }
        }
        return results;
    }
});

const getGroupDescriptionTool = new Tool('get_group_description', {
    description: 'Gets the description of a feature group.',
    run: async (groupName) => {
        const group = groups[groupName];
        if (!group) return `Group '${groupName}' not found.`;
        return group.description;
    }
});

const getSnapshotDescriptionTool = new Tool('get_snapshot_description', {
    description: 'Gets the description of a snapshot.',
    run: async (snapshotName) => {
        const snapshot = snapshots[snapshotName];
        if (!snapshot) return `Snapshot '${snapshotName}' not found.`;
        return snapshot.description;
    }
});

const getFeaturesWithAlternativesTool = new Tool('get_features_with_alternatives', {
    description: 'Returns all discouraged web features that have recommended alternatives.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.discouraged && feature.discouraged.alternatives) {
                results.push({ id: featureId, name: feature.name, alternatives: feature.discouraged.alternatives });
            }
        }
        return results;
    }
});

const getFeatureAlternativeTool = new Tool('get_feature_alternative', {
    description: 'Gets the recommended alternatives for a discouraged web feature.',
    run: async (featureId) => {
        const feature = features[featureId];
        if (!feature || !feature.discouraged) return `Feature '${featureId}' not found or is not discouraged.`;
        return feature.discouraged.alternatives;
    }
});

const getRandomFeatureTool = new Tool('get_random_feature', {
    description: 'Returns a random web feature. Useful for discovery.',
    run: async () => {
        const featureIds = Object.keys(features);
        const randomId = featureIds[Math.floor(Math.random() * featureIds.length)];
        return features[randomId];
    }
});

const getFeaturesWithHtmlDescriptionTool = new Tool('get_features_with_html_description', {
    description: 'Returns web features that have an HTML-formatted description.',
    run: async () => {
        const results = [];
        for (const featureId in features) {
            const feature = features[featureId];
            if (feature.description_html) {
                results.push({ id: featureId, name: feature.name, description_html: feature.description_html });
            }
        }
        return results;
    }
});

const listFeaturesInFileTool = new Tool('list_features_in_file', {
    description: 'Analyzes the provided file content and lists the baseline web features used within it. This tool performs a simplified analysis based on keywords, HTML tags, CSS properties, and JavaScript API calls. It is not a full-fledged parser and may not identify all features or may produce false positives.',
    run: async (fileContent, fileType = null) => {
        return findFeaturesInContent(fileContent, fileType);
    }
});

const getMigrationPathForDiscouragedFeatureTool = new Tool('get_migration_path_for_discouraged_feature', {
    description: 'Suggests a step-by-step migration path or a list of recommended replacement features for a discouraged web feature, possibly with links to documentation.',
    run: async (featureId) => {
        const feature = features[featureId];
        if (!feature || !feature.discouraged) return `Feature '${featureId}' not found or is not discouraged.`;

        let migrationPath = `To migrate from '${feature.name}':\n\n`;

        if (feature.discouraged.alternatives && feature.discouraged.alternatives.length > 0) {
            migrationPath += 'Recommended alternatives:\n';
            for (const alt of feature.discouraged.alternatives) {
                migrationPath += `- ${alt}\n`;
            }
        }

        if (feature.discouraged.according_to && feature.discouraged.according_to.length > 0) {
            migrationPath += '\nFurther reading (official discouragement notices):\n';
            for (const link of feature.discouraged.according_to) {
                migrationPath += `- ${link}\n`;
            }
        }

        // Hypothetical: Add more detailed migration steps if such data were available
        migrationPath += '\n(Note: Detailed step-by-step migration guides are not available in the current dataset, but you can refer to the provided alternatives and official notices for more information.)';

        return migrationPath;
    }
});

const generateBrowserSupportMatrixTool = new Tool('generate_browser_support_matrix', {
    description: 'Generates a simplified browser support matrix for a given list of web features across major browsers.',
    run: async (...featureIds) => {
        const majorBrowsers = ['chrome', 'edge', 'firefox', 'safari'];
        const matrix = {};

        // Header row
        matrix.headers = ['Feature', ...majorBrowsers];

        // Data rows
        matrix.rows = [];
        for (const featureId of featureIds) {
            const feature = features[featureId];
            if (feature) {
                const row = [feature.name || feature.id];
                for (const browser of majorBrowsers) {
                    row.push(feature.status.support[browser] || '-');
                }
                matrix.rows.push(row);
            }
        }
        return matrix;
    }
});


// --- Resources ---

const baselineFeaturesList = new Resource('baseline_features_list', {
    description: 'Returns a list of all available baseline web features. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites.',
    get: async () => {
        return Object.keys(features);
    }
});

// --- Server Setup ---

const server = new McpServer('baseline-feature-suggester', {
  description: 'A server for querying baseline web features data.',
  tools: [
      featureSuggestionTool, 
      checkFeatureSupportTool, 
      getFeatureDetailsTool, 
      getFeaturesByStatusTool,
      getFeaturesByGroupTool,
      getDiscouragedFeaturesTool,
      getFeaturesByCaniuseIdTool,
      getFeaturesWithSpecUrlTool,
      getFeaturesByCompatFeatureTool,
      getBaselineHighSinceTool,
      getBaselineLowSinceTool,
      getFeatureGroupsTool,
      getUnsupportedFeaturesTool,
      getRecentlySupportedFeaturesTool,
      compareFeatureSupportTool,
      getBrowserReleaseDatesTool,
      getSnapshotsTool,
      getFeaturesInSnapshotTool,
      getLatestBrowserVersionsTool,
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
      generateBrowserSupportMatrixTool
    ],
  resources: [baselineFeaturesList]
});

server.runWith(new StdioTransport());