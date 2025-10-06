<p align="center">
  <img src="video-assets/images/mcp.svg" alt="MCP Logo" width="200">
</p>

# Baseline MCP Server

A server for querying baseline web features data. It is built using the `@modelcontextprotocol/sdk` and uses the [`web-features`](https://www.npmjs.com/package/web-features) package as a data source. It was built for the [Baseline Tooling 2025 Hackathon](https://baseline.devpost.com/).

## Prerequisites

- For local development, you will also need Node.js and npm.

## Usage

There are two ways to use the Baseline MCP Server:

1.  **Demo Client:** Try the demo client at [https://baseline-mcp-demo.web.app/](https://baseline-mcp-demo.web.app/).
2.  **Your Own Client:** You can connect your own MCP-compatible client to the server. See the "Connecting a Client" section below for details.

### Connecting a Client

Use the accordion below to configure your client.

<details>
<summary>Connect with Gemini CLI & Gemini Code Assist</summary>

In your `~/.gemini/settings.json`, add one of the following objects to the `mcpServers` array.

```json
{
  "name": "baseline-mcp",
  "command": ["npx", "mcp-remote", "https://baseline-mcp.netlify.app/mcp"]
}
```

</details>

<details>
<summary>Connect with VS Code Copilot</summary>

In your `settings.json` or `.vscode/mcp.json`, add the following configuration. 

```json
"mcp": {
  "servers": {
    "baseline-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://baseline-mcp.netlify.app/mcp"]
    }
  }
}
```

</details>

## Development

If you want to modify or contribute to this tool, follow these instructions for a local setup.

### Installation

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd baseline-mcp`

### Running Locally

1.  **Install dependencies:**
    ```sh
    npm install
    ```

2. **Build the server:**
    ```sh
    npm run build
    ```

3.  **Run the server:**
    ```sh
    npm start
    ```

### Inspecting the Server

To inspect the server's capabilities, you can use the `inspect` script. This is useful for seeing the full list of tools and prompts that the server exposes.

```sh
npm run inspect
```

## Interacting with the Server

Once the server is running, you can send JSON-RPC requests to it. The server exposes the following tools and prompts:

### Prompts

*   `create-study-guide`: Creates a study guide for web features.
*   `find-features-in-file`: Finds baseline features in a given file or directory.
*   `suggest-baseline-features`: Suggests baseline features based on a description of a goal.
*   `min-browser-support-report`: Get the minimum browser support for features in a set of files and display it as a report.

### Tools

#### Feature Queries

*   `list-features`: Returns a list of all available baseline web features.
*   `discouraged-features`: Returns a list of all web features that are discouraged from use.
*   `get-feature-details`: Gets all the details for a specific web feature.
*   `get-feature-by-status`: Gets all web features with a specific baseline status.
*   `get_features_by_caniuse_id`: Gets a web-features feature by its corresponding caniuse.com feature ID.
*   `get_features_with_spec_url`: Gets all web features that reference a specific specification URL.
*   `get_features_by_compat_feature`: Gets a web-features feature by its corresponding @mdn/browser-compat-data feature key.
*   `get_baseline_high_since`: Gets all web features that reached "baseline high" status (widely supported) since a given date.
*   `get_baseline_low_since`: Gets all web features that reached "baseline low" status (newly supported) since a given date.
*   `get_baseline_low_last_30_days`: Gets all web features that reached 'baseline low' status in the last 30 days.
*   `get_baseline_high_last_30_days`: Gets all web features that reached 'baseline high' status in the last 30 days.
*   `get_baseline_status_changes_last_30_days`: Lists all web features that have changed their baseline status in the last 30 days, showing the transition.
*   `get_features_by_description_keyword`: Searches for a keyword only in the description of the web features.
*   `get_features_by_name_keyword`: Searches for a keyword only in the name of the web features.
*   `get_features_with_multiple_spec_urls`: Returns web features that have more than one specification URL.
*   `get_features_with_no_spec_url`: Returns web features that have no specification URL.
*   `get_features_with_alternatives`: Returns all discouraged web features that have recommended alternatives.
*   `get_feature_alternative`: Gets the recommended alternatives for a discouraged web feature.
*   `get_random_feature`: Returns a random web feature.
*   `list_features_in_file`: Analyzes the provided file content and lists the baseline web features used within it.
*   `suggest_baseline_feature`: Suggests a baseline web feature based on a query using keyword matching.

#### Browser Compatibility

*   `get_latest_browser_versions`: Returns the latest version of each major browser.
*   `check_feature_support`: Checks in which version a browser started supporting a specific web feature.
*   `get_unsupported_features`: Returns a list of web features not supported by a given browser.
*   `get_recently_supported_features`: Returns a list of web features that were newly supported in a given browser version.
*   `compare_browser_support`: Compares browser support for two or more web features.
*   `get_browser_release_dates`: Returns a list of release dates and versions for a given browser.
*   `get_browser_release_date`: Returns the release date for a specific browser version.
*   `get_features_not_supported_by_any_browser`: Returns web features not supported by any major browser.
*   `generate_browser_support_matrix`: Generates a simplified browser support matrix for a given list of web features across major browsers.
*   `get_min_browser_support_for_file`: Analyzes file content to determine the minimum browser version required to support all detected web features.

#### Feature Groups and Snapshots

*   `get_feature_groups`: Returns a list of all available feature groups.
*   `get_features_by_group`: Gets all web features in a specific group.
*   `list_snapshots`: Returns a list of all available snapshots.