<p align="center">
  <img src="video-assets/images/mcp.svg" alt="MCP Logo" width="200">
</p>

# Baseline MCP Server

A server for querying baseline web features data. It is built using the `@modelcontextprotocol/sdk` and uses the [`web-features`](https://www.npmjs.com/package/web-features) package as a data source. It was built for the [Baseline Tooling 2025 Hackathon](https://baseline.devpost.com/).

## Prerequisites

- Docker installed on your system.
- For local development, you will also need Node.js and npm.

## Usage

This tool can be used in two ways: via `npx` for a quick, installation-free experience, or via `Docker` for a containerized environment.

### Method 1: Using NPX

This method requires authenticating with GitHub Packages once.

<details>
<summary>Click for first-time authentication setup</summary>

1.  Create a [Personal Access Token (PAT)](https://github.com/settings/tokens) with the `read:packages` scope.

2.  Create or edit the `.npmrc` file in your user home directory (`~/.npmrc`) and add the following lines, replacing `YOUR_PERSONAL_ACCESS_TOKEN` with your token.

    ```
    @Technickel-Dev:registry=https://npm.pkg.github.com/
    //npm.pkg.github.com/:_authToken=YOUR_PERSONAL_ACCESS_TOKEN
    ```

</details>

Once authenticated, you can run the server directly:

```sh
npx @Technickel-Dev/baseline-mcp
```

### Method 2: Using Docker

This method uses a pre-built Docker image and requires no authentication.

```sh
docker run -i --rm ghcr.io/Technickel-Dev/baseline-mcp:latest
```

### Connecting a Client

Use the accordion below to configure your client. Choose the command that matches your preferred method (`npx` or `Docker`).

<details>
<summary>Connect with VS Code Copilot</summary>

In your `settings.json` or `.vscode/mcp.json`, add the following configuration. 

**For NPX:**
```json
"mcp": {
  "servers": {
    "baseline-suggester": {
      "command": "npx",
      "args": ["@Technickel-Dev/baseline-mcp"]
    }
  }
}
```

**For Docker:**
```json
"mcp": {
  "servers": {
    "baseline-suggester": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "ghcr.io/Technickel-Dev/baseline-mcp:latest"]
    }
  }
}
```

</details>

<details>
<summary>Connect with Gemini CLI & Gemini Code Assist</summary>

In your `~/.gemini/settings.json`, add one of the following objects to the `mcpServers` array.

**For NPX:**
```json
{
  "type": "stdio",
  "name": "baseline-suggester",
  "command": ["npx", "@Technickel-Dev/baseline-mcp"]
}
```

**For Docker:**
```json
{
  "type": "stdio",
  "name": "baseline-suggester",
  "command": ["docker", "run", "-i", "--rm", "ghcr.io/Technickel-Dev/baseline-mcp:latest"]
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

2.  **Run the server:**
    ```sh
    npm start
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