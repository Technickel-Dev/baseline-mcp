import { Resource } from "@modelcontextprotocol/sdk";
import { browsers } from "web-features";

export const latestBrowserVersionsResource = new Resource("latest_browser_versions", {
  description: "Returns the latest version of each major browser. This is useful for knowing the most up-to-date browser versions.",
  get: async () => {
    const latestVersions = {};
    for (const browserName in browsers) {
        const browser = browsers[browserName];
        latestVersions[browserName] = browser.releases[browser.releases.length - 1].version;
    }
    return latestVersions;
  }
});
