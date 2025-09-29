import { features } from "web-features";
import {
  FeatureData,
} from "web-features/types";

export const findFeaturesInContent = (
  content: string,
  fileType: string | undefined = undefined
): Record<string, FeatureData> => {
  const foundFeatures: Record<string, FeatureData> = {};
  const lowerContent = content.toLowerCase();

  for (const featureId in features) {
    const feature = features[featureId as keyof typeof features];
    if (feature.kind === "moved" || feature.kind === "split") {
      continue;
    }

    const name = ("name" in feature ? feature.name : "").toLowerCase();
    const description = (
      "description" in feature ? feature.description : ""
    ).toLowerCase();

    // Simple keyword matching for name and description
    if (name && lowerContent.includes(name)) {
      foundFeatures[featureId] = feature;
    }
    if (description && lowerContent.includes(description)) {
      foundFeatures[featureId] = feature;
    }

    // Match compat_features (MDN BCD keys)
    if ("compat_features" in feature && feature.compat_features) {
      for (const compatFeature of feature.compat_features) {
        if (lowerContent.includes(compatFeature.toLowerCase())) {
          foundFeatures[featureId] = feature;
        }
      }
    }

    // Match spec URLs
    if ("spec" in feature && feature.spec) {
      for (const specUrl of feature.spec) {
        if (lowerContent.includes(specUrl.toLowerCase())) {
          foundFeatures[featureId] = feature;
        }
      }
    }

    // Basic HTML element matching
    if (fileType === "html" || !fileType) {
      if (
        "group" in feature &&
        feature.group &&
        feature.group.includes("html-elements")
      ) {
        const tagName = featureId.replace(/element$/, ""); // e.g., 'a' from 'a-element'
        if (
          lowerContent.includes(`<${tagName}`) ||
          lowerContent.includes(`</${tagName}>`)
        ) {
          foundFeatures[featureId] = feature;
        }
      }
    }

    // Basic CSS property matching
    if (fileType === "css" || !fileType) {
      if (
        "group" in feature &&
        feature.group &&
        feature.group.includes("css")
      ) {
        // This is very basic and will need refinement for real-world use
        if (
          lowerContent.includes(name + ":") ||
          lowerContent.includes(name + " ")
        ) {
          foundFeatures[featureId] = feature;
        }
      }
    }

    // Basic JavaScript API matching
    if (
      (fileType === "javascript" || !fileType) &&
      "compat_features" in feature
    ) {
      if (feature.compat_features) {
        for (const compatFeature of feature.compat_features) {
          // Look for common API patterns like 'api.Window.fetch' -> 'window.fetch'
          const jsApiPattern = compatFeature
            .replace(/^api\./, "")
            .replace(/\./g, ".")
            .toLowerCase();
          if (lowerContent.includes(jsApiPattern)) {
            foundFeatures[featureId] = feature;
          }
        }
      }
    }
  }

  return foundFeatures;
};
