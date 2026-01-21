# Playwright Cookies Extraction

Extract and save browser state (cookies + localStorage) from a live Playwright MCP browser session.

## Architecture

This skill bridges browser and Node.js contexts:

1. **Browser**: `browser_run_code` executes generated code → returns state as JSON string
2. **Node.js**: `extract-cookies.js --save` receives JSON → writes to file

> **Warning**: Do NOT use `require()`, `fs`, or file paths inside `browser_run_code` - it runs in browser context, not Node.js. The extraction code uses only browser APIs (`page.context().storageState()`).

## Usage

When the user wants to save the current browser's login state:

1. Run the `extract-cookies.js` script to generate inline code
2. Execute the code via `browser_run_code` MCP tool
3. Save the returned JSON using `--save` mode

## Commands

Generate extraction code:
```bash
node extract-cookies.js
```

Save extracted state:
```bash
echo '<json-result>' | node extract-cookies.js --save [file]
```

## Options

- `--save [file]` - Save piped JSON to file (default: `auth-state.json`)
- `--cookies-only` - Only extract cookies, skip localStorage (smaller payload)

## Example Workflow

1. User says: "save my current browser login state"
2. Run: `node extract-cookies.js`
3. Copy the generated code:
   ```javascript
   async (page) => {
     const state = await page.context().storageState();
     return JSON.stringify(state, null, 2);
   }
   ```
4. Call `browser_run_code` with the generated code
5. Save the result:
   ```bash
   echo '<result-json>' | node extract-cookies.js --save
   ```

## Output File

Default output: `./auth-state.json`

This file is compatible with:
- Playwright's `storageState` option
- The `hot-cookies-injection` skill for injecting into another session
