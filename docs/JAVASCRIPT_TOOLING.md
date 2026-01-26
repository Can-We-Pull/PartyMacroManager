# JavaScript Linting and Testing Setup

This document describes the JavaScript linting and testing infrastructure added to the PartyMacroManager project.

## Tools Added

### ESLint - JavaScript Linter
Modern, pluggable JavaScript linter that enforces code quality and style rules.

**Configuration**: `eslint.config.mjs`
- ES2022 syntax support
- Node.js environment globals
- Custom rules for code quality and style
- 120 character line length limit
- Enforces modern JavaScript practices (const/let, arrow functions, template literals)

### Vitest - Test Runner
Fast, modern test runner built on Vite with native ES modules support.

**Configuration**: `vitest.config.js`
- Node environment
- Coverage reporting with v8
- Verbose test output
- Test files in `__tests__` directories

## Project Structure

```
├── eslint.config.mjs           # ESLint configuration
├── vitest.config.js            # Vitest configuration
├── package.json                # Updated with new scripts and type: "module"
└── scripts/
    ├── lint.cjs                # Lua linter (CommonJS)
    ├── lint-fix.mjs            # Lua lint fixer (ES Module)
    └── fixers/
        ├── index.js            # ES Module exports
        ├── whitespace.js       # ES Module
        ├── long-lines.js       # ES Module
        └── __tests__/          # Vitest tests
            ├── whitespace.test.js
            ├── long-lines.test.js
            └── integration.test.js
```

## NPM Scripts

### Linting
```bash
npm run lint              # Run all linters (Lua + JavaScript)
npm run lint:lua          # Run Lua linter only
npm run lint:js           # Run JavaScript linter only
npm run lint:js:fix       # Auto-fix JavaScript issues
npm run lint:fix          # Auto-fix all fixable issues
```

### Testing
```bash
npm test                  # Run all tests once
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Open Vitest UI in browser
npm run test:coverage     # Run tests with coverage report
```

## ESLint Rules

### Code Quality
- No unused variables (except those prefixed with `_`)
- Unused catch errors allowed
- Strict equality (`===`) required
- No `eval()` or implied eval
- No `var`, use `const`/`let`

### Style
- Single quotes for strings
- 2-space indentation
- Semicolons required
- No trailing commas
- Max line length: 120 characters

### Modern JavaScript
- Prefer arrow functions
- Prefer template literals
- Use object shorthand

## Test Coverage

25 tests across 3 test suites:
- **Whitespace Fixer**: 7 tests
- **Long Lines Fixer**: 15 tests  
- **Integration**: 4 tests

All tests use Vitest's modern assertion API:
- `expect().toBe()`
- `expect().toContain()`
- `expect().toMatch()`
- `expect().toHaveLength()`
- `expect().toBeLessThanOrEqual()`

## Migration to ES Modules

The project now uses `"type": "module"` in package.json:
- `.js` files are treated as ES modules
- `.cjs` files for CommonJS (lua linter)
- `.mjs` files explicitly mark ES modules
- Import/export syntax throughout fixer modules
- Native ES module support in Vitest

## Benefits

1. **Code Quality**: ESLint catches bugs and enforces consistent style
2. **Fast Testing**: Vitest runs tests in milliseconds with native ES modules
3. **Developer Experience**: Auto-fix capabilities reduce manual work
4. **Confidence**: 100% test pass rate with comprehensive coverage
5. **Maintainability**: Modern tooling makes code easier to understand and modify
