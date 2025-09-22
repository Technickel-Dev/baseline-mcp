import { Resource } from "@modelcontextprotocol/sdk";
import { features } from "web-features";

export const baselineFeaturesList = new Resource("baseline_features_list", {
  description:
    "Returns a list of all available baseline web features. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites.",
  get: async () => {
    return Object.keys(features);
  },
});

export const discouragedFeaturesResource = new Resource("discouraged_features", {
  description: "Returns a list of all web features that are discouraged from use. This is important for avoiding obsolete or problematic features.",
  get: async () => {
    const results = [];
    for (const featureId in features) {
      const feature = features[featureId];
      if (feature.discouraged) {
        results.push({
          id: featureId,
          name: feature.name,
          discouraged: feature.discouraged,
        });
      }
    }
    return results;
  }
});
