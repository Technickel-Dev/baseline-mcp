import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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

  server.registerPrompt(
    "find-features-in-file",
    {
      title: "Find Features in File or Directory",
      description: "Finds baseline features in a given file or directory.",
      argsSchema: {
        filePath: z.string().describe("The path to the file or directory to analyze."),
      },
    },
    ({ filePath }) => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: findFeaturesInFilePrompt(filePath),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "suggest-baseline-features",
    {
      title: "Suggest Baseline Features",
      description: "Suggests baseline features based on a description of a goal.",
      argsSchema: {
        goal: z.string().describe("The description of the goal."),
      },
    },
    ({ goal }) => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: suggestBaselineFeaturePrompt(goal),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "min-browser-support-report",
    {
      title: "Minimum Browser Support Report",
      description:
        "Get the minimum browser support for features in a set of files and display it as a report.",
      argsSchema: {
        filePath: z
          .string()
          .describe("The path to the file or directory to analyze."),
      },
    },
    ({ filePath }) => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: minBrowserSupportReportPrompt(filePath),
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

export const findFeaturesInFilePrompt = (filePath: string) =>
  `Read the file or files in the directory at the path "${filePath}" and find the baseline features in them. Provide a full list of the features found in the output.`;

export const suggestBaselineFeaturePrompt = (goal: string) =>
  `Suggest one or more baseline features for the following goal: "${goal}"`;

export const minBrowserSupportReportPrompt = (filePath: string) =>
  `Get the minimum browser support for the features of the file or files in the directory "${filePath}". Output the results as an easy to read read report with reasoning and a minumum support table in a markdown file`;
