# MCP Server for Baseline Feature Suggestions

This server provides tools and resources to suggest and query baseline web features. It is built using the `modelcontextprotocol-ts-sdk`.

## Prerequisites

- Node.js and npm installed on your system.

## Installation

1. Clone the repository or download the files.
2. Open a terminal and navigate to the `mcp_server` directory:
   ```bash
   cd mcp_server
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Server

To start the server, run the following command:

```bash
npm start
```

The server will start and listen for JSON-RPC messages on standard input.

## Interacting with the Server

Once the server is running, you can send JSON-RPC requests to it. The server exposes the following resources and tools:

### Resource: `baseline_features_list`

This resource returns a list of all available baseline feature IDs. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"baseline_features_list"}
```

### Tools

Here is a list of all available tools with their descriptions and example requests.

#### `suggest_baseline_feature`

Suggests a baseline web feature based on a query. Baseline features are a set of web platform features that are broadly supported across major browsers, making them safe to use in production websites. This tool helps you find the right feature for what you are trying to build.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"suggest_baseline_feature","params":["animation"]}
```

#### `check_feature_support`

Checks in which version a browser started supporting a specific web feature. This is useful for determining browser compatibility.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"check_feature_support","params":["animations-css","chrome"]}
```

#### `get_feature_details`

Gets all the details for a specific web feature, including its name, description, specification URL, and support status.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_feature_details","params":["animations-css"]}
```

#### `get_features_by_status`

Gets all web features with a specific baseline status. The status can be "high" (widely supported), "low" (newly supported), or false (not baseline). This helps in understanding the maturity of a feature.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_by_status","params":["high"]}
```

#### `get_features_by_group`

Gets all web features in a specific group, such as "css" or "javascript". This is useful for exploring features within a certain technology.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_by_group","params":["css"]}
```

#### `get_discouraged_features`

Returns a list of all web features that are discouraged from use. This is important for avoiding obsolete or problematic features.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_discouraged_features"}
```

#### `get_features_by_caniuse_id`

Gets a web-features feature by its corresponding caniuse.com feature ID. Caniuse.com is a popular website for checking browser support for web features.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_by_caniuse_id","params":["css-animation"]}
```

#### `get_features_with_spec_url`

Gets all web features that reference a specific specification URL. This is useful for finding features defined in a particular web standard.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_spec_url","params":["https://drafts.csswg.org/css-animations-2/"]}
```

#### `get_features_by_compat_feature`

Gets a web-features feature by its corresponding @mdn/browser-compat-data feature key. This data is used by the Mozilla Developer Network (MDN) to display browser compatibility tables.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_by_compat_feature","params":["api.AnimationEvent"]}
```

#### `get_baseline_high_since`

Gets all web features that reached "baseline high" status (widely supported) since a given date. This helps track the adoption of new features over time.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_baseline_high_since","params":["2022-01-01"]}
```

#### `get_baseline_low_since`

Gets all web features that reached "baseline low" status (newly supported) since a given date. This helps track the emergence of new features.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_baseline_low_since","params":["2023-01-01"]}
```

#### `get_feature_groups`

Returns a list of all available feature groups. These groups categorize features by technology (e.g., "css", "javascript").

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_feature_groups"}
```

#### `get_unsupported_features`

Returns a list of web features not supported by a given browser. This is useful for identifying potential compatibility issues.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_unsupported_features","params":["safari"]}
```

#### `get_recently_supported_features`

Returns a list of web features that were newly supported in a given browser version. This helps in understanding the evolution of a browser's capabilities.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_recently_supported_features","params":["chrome","100"]}
```

#### `compare_feature_support`

Compares browser support for two or more web features. This is useful for making informed decisions about which features to use.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"compare_feature_support","params":["animations-css","websockets"]}
```

#### `get_browser_release_dates`

Returns a list of release dates and versions for a given browser. This provides historical data about a browser's development.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_browser_release_dates","params":["chrome"]}
```

#### `get_snapshots`

Returns a list of all available snapshots. Snapshots are collections of features that represent a specific version of a technology, such as "ecmascript-2022".

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_snapshots"}
```

#### `get_features_in_snapshot`

Gets all web features in a given snapshot. This is useful for understanding the feature set of a specific technology version.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_in_snapshot","params":["ecmascript-2022"]}
```

#### `get_latest_browser_versions`

Returns the latest version of each major browser. This is useful for knowing the most up-to-date browser versions.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_latest_browser_versions"}
```

#### `get_browser_release_date`

Returns the release date for a specific browser version. This helps in understanding when a particular browser version was released.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_browser_release_date","params":["chrome","100"]}
```

#### `get_features_by_description_keyword`

Searches for a keyword only in the description of the web features. This allows for a more targeted search than the general suggest_baseline_feature tool.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_by_description_keyword","params":["animation"]}
```

#### `get_features_by_name_keyword`

Searches for a keyword only in the name of the web features. This allows for a more targeted search.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_by_name_keyword","params":["animation"]}
```

#### `get_features_with_multiple_spec_urls`

Returns web features that have more than one specification URL. This can indicate that a feature is defined across multiple standards.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_multiple_spec_urls"}
```

#### `get_features_with_no_spec_url`

Returns web features that have no specification URL. This may indicate that a feature is non-standard or proprietary.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_no_spec_url"}
```

#### `get_features_with_caniuse_mapping`

Returns all web features that have a mapping to a caniuse.com feature ID.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_caniuse_mapping"}
```

#### `get_features_with_compat_features_mapping`

Returns all web features that have a mapping to a @mdn/browser-compat-data feature key.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_compat_features_mapping"}
```

#### `get_features_supported_by_all_browsers`

Returns web features supported by all major browsers (chrome, edge, firefox, safari). These are the most reliable features to use.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_supported_by_all_browsers"}
```

#### `get_features_supported_by_any_browser`

Returns web features supported by at least one major browser.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_supported_by_any_browser"}
```

#### `get_features_not_supported_by_any_browser`

Returns web features not supported by any major browser. These features are likely experimental or obsolete.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_not_supported_by_any_browser"}
```

#### `get_group_description`

Gets the description of a feature group.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_group_description","params":["css"]}
```

#### `get_snapshot_description`

Gets the description of a snapshot.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_snapshot_description","params":["ecmascript-2022"]}
```

#### `get_features_with_alternatives`

Returns all discouraged web features that have recommended alternatives.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_alternatives"}
```

#### `get_feature_alternative`

Gets the recommended alternatives for a discouraged web feature.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_feature_alternative","params":["accessor-methods"]}
```

#### `get_random_feature`

Returns a random web feature. Useful for discovery.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_random_feature"}
```

#### `get_features_with_html_description`

Returns web features that have an HTML-formatted description.

**Example Request:**

```json
{"jsonrpc":"2.0","method":"get_features_with_html_description"}
```