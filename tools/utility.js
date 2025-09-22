const { Tool } = require('@modelcontextprotocol/sdk');
const { snapshots } = require('web-features');

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

const getSnapshotDescriptionTool = new Tool('get_snapshot_description', {
    description: 'Gets the description of a snapshot.',
    run: async (snapshotName) => {
        const snapshot = snapshots[snapshotName];
        if (!snapshot) return `Snapshot '${snapshotName}' not found.`;
        return snapshot.description;
    }
});

module.exports = {
    getFeaturesInSnapshotTool,
    getSnapshotDescriptionTool
};