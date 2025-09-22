import { Resource } from "@modelcontextprotocol/sdk";
import { snapshots } from "web-features";

export const snapshotsResource = new Resource("snapshots", {
  description: 'Returns a list of all available snapshots. Snapshots are collections of features that represent a specific version of a technology, such as "ecmascript-2022".',
  get: async () => {
    return Object.keys(snapshots);
  }
});
