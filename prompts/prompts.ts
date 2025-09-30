import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const registerPrompts = (server: McpServer) => {
  server.registerPrompt(
    "create-study-guide",
    {
      title: "Create Study Guide",
      description: "Creates a study guide for web features.",
    },
    () => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: studyGuidePrompt,
          },
        },
      ],
    })
  );
};

export const studyGuidePrompt = `Create a visually appealing markdown study guide in the current directory for the newest and most recently stable web features.

**Date:** ${new Date().toDateString()}

For the "newly stable features," get the features that have reached "baseline high" status in the last 30 days.
For the "newest features," get the features that have reached "baseline low" status in the last 30 days.

For each feature in both sections, please include:
*   The feature name.
*   A description of the feature.
*   A link to the feature's specification.
*   A practical code example of how to use the feature.

Please format the study guide in a way that is easy to read and visually appealing, making use of emojis, using markdown features like headings, code blocks for examples, and tables if it makes sense.`;