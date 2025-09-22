const { Tool } = require('@modelcontextprotocol/sdk');
const { features, browsers } = require('web-features');

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

module.exports = {
    checkFeatureSupportTool,
    getUnsupportedFeaturesTool,
    getRecentlySupportedFeaturesTool,
    compareFeatureSupportTool,
    getBrowserReleaseDatesTool,
    getBrowserReleaseDateTool,
    getFeaturesSupportedByAllBrowsersTool,
    getFeaturesSupportedByAnyBrowserTool,
    getFeaturesNotSupportedByAnyBrowserTool,
    generateBrowserSupportMatrixTool
};
