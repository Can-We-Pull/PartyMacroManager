# Lint Fixers

This directory contains modular lint fixing logic for automatically correcting common code style issues in Lua files.

## Architecture

The fixer system is broken down into separate modules for maintainability and testability:

```
scripts/
├── lint-fix.js              # Main script that orchestrates file processing
├── fixers/
│   ├── index.js             # Exports all fixers and applyAllFixes()
│   ├── whitespace.js        # Fixes trailing whitespace issues
│   ├── long-lines.js        # Breaks up lines exceeding max length
│   └── __tests__/           # Unit tests for each fixer
│       ├── whitespace.test.js
│       ├── long-lines.test.js
│       └── integration.test.js
└── test-fixers.js           # Test runner
```

## Modules

### `whitespace.js`

Handles whitespace-related issues:
- Removes trailing whitespace from lines
- Removes whitespace-only lines
- Ensures files end with a newline

**API:**
```javascript
const { fixWhitespace } = require('./fixers/whitespace');
const result = fixWhitespace(content);
// Returns: { content: string, fixed: number }
```

### `long-lines.js`

Intelligently breaks lines that exceed the maximum length (default 120 characters):

**Strategies:**
1. **String assignments** - Breaks long string literals at natural boundaries (spaces, punctuation)
   ```lua
   -- Before:
   local text = "This is a very long string that exceeds the limit"
   
   -- After:
   local text = "This is a very long string"
       .. "that exceeds the limit"
   ```

2. **Concatenated strings** - Further breaks already-concatenated strings
   ```lua
   -- Before:
   .. "Another very long concatenated string that still exceeds the limit"
   
   -- After:
   .. "Another very long concatenated string"
   .. "that still exceeds the limit"
   ```

3. **Function calls** - Breaks function calls with long string arguments
   ```lua
   -- Before:
   GameTooltip:AddLine("Very long tooltip text", nil, nil, nil, true)
   
   -- After:
   GameTooltip:AddLine(
       "Very long tooltip "
       .. "text", nil, nil, nil, true
   )
   ```

**API:**
```javascript
const { fixLongLines } = require('./fixers/long-lines');
const result = fixLongLines(content, maxLength);
// Returns: { content: string, fixed: number }

// Individual breaking functions:
const lines = breakStringAssignment(line, maxLength);    // Array<string> | null
const lines = breakConcatenatedString(line, maxLength);  // Array<string> | null
const lines = breakFunctionCall(line, maxLength);        // Array<string> | null
```

### `index.js`

Provides a unified interface for applying all fixes:

```javascript
const { applyAllFixes } = require('./fixers');
const result = applyAllFixes(content);
// Returns: { 
//   content: string,
//   whitespaceFixed: number,
//   longLinesFixed: number 
// }
```

## Running Tests

Run all unit tests:
```bash
npm test
```

Tests cover:
- Whitespace removal (7 test cases)
- Long line breaking (15 test cases)
- Integration scenarios (4 test cases)

## Adding New Fixers

1. Create a new module in `scripts/fixers/your-fixer.js`
2. Export a function that takes content and returns `{ content, fixed }`
3. Add your fixer to `scripts/fixers/index.js`
4. Create tests in `scripts/fixers/__tests__/your-fixer.test.js`
5. Update this README

## Design Principles

- **Modularity**: Each fixer is independent and can be tested in isolation
- **Composability**: Fixers can be chained together via `applyAllFixes()`
- **Non-destructive**: Fixers only modify content if they can do so safely
- **Testability**: Pure functions that transform strings make testing straightforward
- **Transparency**: Each fixer reports how many issues it fixed
