# Playwright Cookies Extraction

An agent skill for extracting and saving browser state (cookies + localStorage) from a live Playwright MCP browser session.

This skill is designed for AI coding agents (like Claude Code) that use Playwright MCP for browser automation. It generates inline JavaScript code that can be executed via the `browser_run_code` tool to extract the current browser state, and provides a utility to save the extracted JSON to a file for later session restoration.

## Installation

```bash
git clone https://github.com/oreasono/playwright-cookies-extraction.git
cd playwright-cookies-extraction
```

No dependencies required - uses Node.js built-in modules only.

## Usage

### 1. Generate Extraction Code

```bash
node extract-cookies.js [--cookies-only]
```

### 2. Save Extracted State

```bash
echo '<json-result>' | node extract-cookies.js --save [file]
```

### Options

| Option | Description |
|--------|-------------|
| `--cookies-only` | Only extract cookies, skip localStorage (smaller payload) |
| `--save [file]` | Save piped JSON to file (default: `auth-state.json`) |
| `--help` | Show help message |

## Example Workflow

**Step 1:** Generate extraction code
```bash
node extract-cookies.js
```

Output:
```javascript
async (page) => {
  const state = await page.context().storageState();
  return JSON.stringify(state, null, 2);
}
```

**Step 2:** Execute in Playwright MCP

Copy the generated code and run it via the `browser_run_code` MCP tool. The tool will return the browser state as JSON.

**Step 3:** Save the result
```bash
echo '{"cookies":[...],"origins":[]}' | node extract-cookies.js --save
```

Output:
```
State saved to: /path/to/auth-state.json
Stats: 5 cookies, 2 origins
```

## Output Format

The saved state file follows Playwright's [storageState](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state) format:

```json
{
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "expires": 1234567890,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://example.com",
      "localStorage": [
        { "name": "key", "value": "value" }
      ]
    }
  ]
}
```

## Related

- [hot-cookies-injection](https://github.com/oreasono/hot-cookies-injection) - Inject cookies into Playwright browser

## License

MIT
