#!/usr/bin/env node
/**
 * Playwright Cookies Extraction
 *
 * Generates inline code for Playwright MCP browser_run_code tool
 * to extract cookies and storage state from the current browser session.
 *
 * Usage:
 *   node extract-cookies.js              # Generate extraction code
 *   node extract-cookies.js --save       # Save piped JSON to auth-state.json
 *
 * Options:
 *   --save [file]    Save piped JSON to file (default: auth-state.json)
 *   --cookies-only   Only extract cookies, not localStorage
 */

const fs = require('fs');
const path = require('path');

function generateExtractionCode(options = {}) {
  if (options.cookiesOnly) {
    return `async (page) => {
  const cookies = await page.context().cookies();
  return JSON.stringify({ cookies }, null, 2);
}`;
  }

  return `async (page) => {
  const state = await page.context().storageState();
  return JSON.stringify(state, null, 2);
}`;
}

function saveState(outputFile) {
  let input = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    input += chunk;
  });

  process.stdin.on('end', () => {
    if (!input.trim()) {
      console.error('Error: No JSON input received');
      console.error('Usage: echo \'{"cookies":[]}\' | node extract-cookies.js --save');
      process.exit(1);
    }

    try {
      // Validate JSON
      const state = JSON.parse(input);

      // Ensure it has the expected structure
      if (!state.cookies && !state.origins) {
        console.error('Warning: Input does not look like a storageState object');
      }

      const fullPath = path.resolve(outputFile);
      fs.writeFileSync(fullPath, JSON.stringify(state, null, 2));
      console.log(`State saved to: ${fullPath}`);

      // Stats
      const cookieCount = state.cookies ? state.cookies.length : 0;
      const originCount = state.origins ? state.origins.length : 0;
      console.log(`Stats: ${cookieCount} cookies, ${originCount} origins`);

    } catch (err) {
      console.error(`Error parsing JSON: ${err.message}`);
      process.exit(1);
    }
  });
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Playwright Cookies Extraction
==============================
Extract and save browser state from Playwright MCP.

Usage:
  node extract-cookies.js              # Generate extraction code
  node extract-cookies.js --save       # Save piped JSON to auth-state.json

Options:
  --save [file]    Save piped JSON to file (default: auth-state.json)
  --cookies-only   Only extract cookies, not localStorage
  --help           Show this help

Workflow:
  1. Run: node extract-cookies.js
  2. Copy the generated code
  3. Execute via browser_run_code MCP tool
  4. Save the result: echo '<result>' | node extract-cookies.js --save

Examples:
  node extract-cookies.js                           # Get extraction code
  node extract-cookies.js --cookies-only            # Cookies only (smaller)
  echo '{"cookies":[]}' | node extract-cookies.js --save
  echo '{"cookies":[]}' | node extract-cookies.js --save my-state.json
`);
    process.exit(0);
  }

  const saveIndex = args.indexOf('--save');
  const cookiesOnly = args.includes('--cookies-only');

  if (saveIndex !== -1) {
    // Save mode: read from stdin and write to file
    const outputFile = args[saveIndex + 1] && !args[saveIndex + 1].startsWith('--')
      ? args[saveIndex + 1]
      : 'auth-state.json';
    saveState(outputFile);
  } else {
    // Generate mode: output extraction code
    const code = generateExtractionCode({ cookiesOnly });

    console.log('// Playwright Cookies Extraction');
    console.log('// Generated inline code for browser_run_code');
    console.log('// Copy and paste this into the MCP tool parameter');
    console.log('');
    console.log(code);
    console.log('');
    console.log('// After running, save the result:');
    console.log('// echo \'<result>\' | node extract-cookies.js --save');
  }
}

main();
